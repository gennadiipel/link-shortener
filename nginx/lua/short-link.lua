local redis = require "resty.redis"

local function fallback(code)
  return ngx.exec("/_internal/resolve-link?code=" .. ngx.escape_uri(code))
end

local code = ngx.var.short_code
local targets = ngx.shared.link_targets
local counters = ngx.shared.link_counters
local dirty_codes = ngx.shared.link_counter_dirty

local target_url = targets:get(code)

if target_url then
  local _, counter_error = counters:incr(code, 1, 0)
  if counter_error then
    ngx.log(ngx.WARN, "In-process counter increment failed for code ", code, ": ", counter_error)
  else
    local ok, dirty_error = dirty_codes:set(code, true, 5)
    if not ok then
      ngx.log(ngx.WARN, "Unable to mark counter dirty for code ", code, ": ", dirty_error)
    end
  end
else
  local client = redis:new()
  client:set_timeouts(10, 10, 10)

  local connected, connect_error = client:connect("redis", 6379)
  if not connected then
    ngx.log(ngx.WARN, "Redis connection failed: ", connect_error)
    return fallback(code)
  end

  -- One Redis round trip: resolve the target and increment only if it exists.
  local result, resolve_error = client:eval([[
    local target = redis.call("GET", KEYS[1])
    if not target then
      return nil
    end
    redis.call("INCR", KEYS[2])
    return target
  ]], 2, "url:" .. code, "opens:" .. code)
  client:set_keepalive(60000, 1024)

  if resolve_error then
    ngx.log(ngx.WARN, "Redis cache lookup failed: ", resolve_error)
    return fallback(code)
  end

  if result == ngx.null then
    return fallback(code)
  end

  target_url = result
  local ok, target_error = targets:set(code, target_url)
  if not ok then
    ngx.log(ngx.WARN, "Unable to populate in-process target cache for code ", code, ": ", target_error)
  end
end

ngx.header["Cache-Control"] = "no-store"
return ngx.redirect(target_url, 302)

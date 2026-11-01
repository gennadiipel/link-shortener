local redis = require "resty.redis"

local function fallback(code)
  return ngx.exec("/_internal/resolve-link?code=" .. ngx.escape_uri(code))
end

local code = ngx.var.short_code
local client = redis:new()
client:set_timeouts(50, 50, 50)

local connected, connect_error = client:connect("redis", 6379)
if not connected then
  ngx.log(ngx.WARN, "Redis connection failed: ", connect_error)
  return fallback(code)
end

local target_url, get_error = client:get("url:" .. code)
if get_error then
  ngx.log(ngx.WARN, "Redis cache lookup failed: ", get_error)
  client:set_keepalive(10000, 100)
  return fallback(code)
end

if target_url == ngx.null then
  client:set_keepalive(10000, 100)
  return fallback(code)
end

local _, increment_error = client:incr("opens:" .. code)
client:set_keepalive(10000, 100)

if increment_error then
  ngx.log(ngx.WARN, "Redis counter increment failed: ", increment_error)
  return fallback(code)
end

ngx.header["Cache-Control"] = "no-store"
return ngx.redirect(target_url, 302)

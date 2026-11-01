local redis = require "resty.redis"

local counters = ngx.shared.link_counters
local dirty_codes = ngx.shared.link_counter_dirty
local flush_interval_seconds = 1
local flush_batch_size = 2048

local function schedule_next_flush()
  local ok, err = ngx.timer.at(flush_interval_seconds, function(premature)
    if premature then
      return
    end

    local codes = dirty_codes:get_keys(flush_batch_size)
    if #codes > 0 then
      local client = redis:new()
      client:set_timeouts(10, 10, 10)

      local connected, connect_error = client:connect("redis", 6379)
      if not connected then
        ngx.log(ngx.WARN, "Redis counter flush connection failed: ", connect_error)
      else
        for _, code in ipairs(codes) do
          local count = counters:get(code)
          if count and count > 0 then
            local _, increment_error = client:incrby("opens:" .. code, count)
            if increment_error then
              ngx.log(ngx.WARN, "Redis counter flush failed for code ", code, ": ", increment_error)
            else
              -- New redirects that arrive while this is running remain in the
              -- shared counter after this subtraction and are flushed later.
              counters:incr(code, -count)
            end
          end
        end

        client:set_keepalive(60000, 1024)
      end
    end

    schedule_next_flush()
  end)

  if not ok then
    ngx.log(ngx.ERR, "Unable to schedule Redis counter flush: ", err)
  end
end

-- Shared dictionaries are visible to every worker, so exactly one worker
-- performs periodic Redis flushes.
if ngx.worker.id() == 0 then
  schedule_next_flush()
end

# Copyright (C) 2012-2024 Zammad Foundation, https://zammad-foundation.org/

class SecureMailing::PGP::Retry < SecureMailing::Backend::HandlerRetry
  def type
    'PGP'
  end
end

class API < Grape::API
  # prefix : urlの「ドメイン直下」に入る文字列。
  #   https://DOMAIN/HERE/v1/hoges
  prefix 'api'
  mount Resources::V1::Root
end

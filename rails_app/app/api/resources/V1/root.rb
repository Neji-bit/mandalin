module Resources
  module V1
    class Root < Grape::API
      # Devise認証を通っている時だけ、APIを使える。
      # 認証が不要なAPIについては 'route_setting :auth, disabled: true' を設定すること。
      before do
        unless (route.settings&.[](:auth)&.[](:disabled)) then
          error!("Unauthorized.", 401) unless current_user
        end
      end

      version 'v1'
      format :json
      content_type :json, 'application/json'

      helpers do
        # Deviseからcurrent_userを引っ張り出す。
        def current_user 
          begin
            User.find(env['rack.session']['warden.user.user.key'].first.first)
          rescue
            nil
          end
        end

        # Session情報を引っ張り出す。
        def session
          env["rack.session"]
        end
      end
  
      mount Resources::V1::Books
      mount Resources::V1::Pages
      mount Resources::V1::UserProperties
    end
  end
end

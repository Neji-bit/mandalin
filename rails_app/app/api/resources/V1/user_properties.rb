module Resources
  module V1
    class UserProperties < Grape::API
      # 「ユーザー本人の情報」へのアクセス
      resources 'user_property' do
        desc 'Return a user_property data.'
        route_setting :auth, disabled: true
        params do
        end
        get do
          begin
            raise unless current_user
            json = JSON.parse(current_user.property.text)
            # 各リストにて、すでに管理されているブックのIDリスト（ソート後）を取得する
            favorites = json["books"]["booksFavorites"].map{|x| x["id"]}.filter{|x| x}
            histories = json["books"]["booksHistories"].map{|x| x["id"]}.filter{|x| x}
            # 「所有しているブックのリスト」は「すでにデータで管理されているもの」に「まだ管理されていないもの」を付け加える。
            owns = json["books"]["booksOwns"].map{|x| x["id"]}.filter{|x| x}
            owns_actually = Book.where(owner: current_user).order(:id).map{|b| b.id}
            owns_unregistries = [owns, owns_actually].flatten.tally.filter{|k, v| v == 1}.map{|k, v| k}.sort
            owns = [owns, owns_unregistries].flatten

            # 各ブックの、現在のタイトルを取得し、ソート順で並べる。
            favorites_names = Book.where(id: favorites).map{|x| {"id" => x.id, "name" => x.name.gsub(" ", "").blank? ? "<タイトル未設定>" : x.name}}
            histories_names = Book.where(id: histories).map{|x| {"id" => x.id, "name" => x.name.gsub(" ", "").blank? ? "<タイトル未設定>" : x.name}}
            owns_names = Book.where(id: owns).map{|x| {"id" => x.id, "name" => x.name.gsub(" ", "").blank? ? "<タイトル未設定>" : x.name}}
            favorites = favorites.map{|i| favorites_names.find{|n| n["id"] == i}}
            histories = histories.map{|i| histories_names.find{|n| n["id"] == i}}
            owns = owns.map{|i| owns_names.find{|n| n["id"] == i}}

            json["books"]["booksFavorites"] = favorites
            json["books"]["booksHistories"] = histories
            json["books"]["booksOwns"] = owns
            present JSON.generate(json)
          rescue
            error!("Sorry, you are not authenticated.", 404)
          end
        end

        desc 'Update a user_property data.'
        params do
          requires :text, type: String, desc: 'json of user_property'
        end
        put do
          begin
            current_user.property.update!(text: params[:text])
          rescue
            error!("Sorry, you are not authenticated.", 404)
          end
        end
      end
    end
  end
end

module Resources
  module V1
    class Books < Grape::API
      resource :books do
        desc 'Return books data.'
        get do
          present Book.all.map(&:name)
        end
      end

      resources 'book/:id' do
        # GETでの処理：
        #   ここにくる＝コントローラでupsertが済んでいる。
        desc 'Return a book data.'
        route_setting :auth, disabled: true
        params do
          requires :id, type: Integer, desc: 'book id.'
        end
        get do
          begin
            book = Book.find(params[:id])

            # app_infoを作成する。コードの重複あるので、後で整理する。
            json = JSON.parse(book.text)
            json["app_info"]["visitor_email"] = current_user ? current_user.email : nil
            json["app_info"]["is_owner"] = (current_user == book.owner)
            unless(json["app_info"]["is_owner"]) then
              unless(json["book"]["authorization"]["is_public"]) then
                raise
              end
            end

            present JSON.generate(json)
          rescue
            error!("Not found!", 404)
          end
        end

        desc 'Update a book data.'
        params do
          requires :id, type: Integer, desc: 'book id.'
          optional :name, type: String, desc: 'name of book'
          optional :text, type: String, desc: 'json of book'
        end
        put do
          begin
            book = Book.find(params[:id])
            if(book && book.owner == current_user) then
              update_params = {}
              update_params[:name] = params[:name] if params[:name]
              update_params[:text] = params[:text] if params[:text]
              book.update(update_params)
              present true
            else
              error!("Unauthorized. You are not owner of the book.", 401)
            end
          rescue
            error!("Not found!", 404)
          end
        end
      end
    end
  end
end

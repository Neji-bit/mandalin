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
        #   find_or_initialize_by の動きをする。 
        #   あえて、外部からの明示的なPOSTは作らない。
        desc 'Return a book data.'
        route_setting :auth, disabled: true
        params do
          requires :id, type: Integer, desc: 'book id.'
        end
        get do
          begin
            present Book.find(params[:id]).text
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

module Resources
  module V1
    class Books < Grape::API
      resource :books do
        desc 'Return books data.'
        get do
          present Book.all.map(&:name)
        end
      end

      resources 'book/:name' do
        desc 'Return a book data.'
        params do
          requires :name, type: String, desc: 'book name.'
        end
        get do
          begin
            present Book.find_by(name: params[:name]).text
          rescue
            error!("Not found!", 404)
          end
        end

        desc 'Create a book data.'
        params do
          requires :name, type: String, desc: 'name of book'
          requires :text, type: String, desc: 'json of book'
        end
        post do
          begin
            Book.create({
              name: params[:name],
              text: params[:text]
            })
            present true
          rescue
            error!("Duplicate!", 500)
          end
        end

        desc 'Update a book data.'
        params do
          requires :text, type: String, desc: 'json of book'
        end
        put do
          begin
            Book.find_by(name: params[:name]).update(text: params[:text])
            present true
          rescue
            error!("Not found!", 404)
          end
        end
      end
    end
  end
end

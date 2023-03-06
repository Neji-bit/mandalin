module Resources
  module V1
    class Pages < Grape::API
      resource 'book/:book_id/pages' do
        desc 'Return pages data.'
        params do
          requires :book_id, type: Integer, desc: 'book id.'
        end
        get do
          present Book.find(id: params[:book_id])&.pages.map(&:name) || []
        end
      end

      resources 'book/:book_id/page/:page_name' do
        desc 'Return a page data.'
        route_setting :auth, disabled: true
        params do
          requires :book_id, type: Integer, desc: 'book id.'
          requires :page_name, type: String, desc: 'page name.'
        end
        get do
          begin
            present Book.find(params[:book_id]).pages.where(name: params[:page_name]).take.text
          rescue
            error!("Not found!", 404)
          end
        end

        desc 'Create a page data.'
        params do
          requires :book_id, type: Integer, desc: 'book id.'
          requires :page_name, type: String, desc: 'page name.'
          requires :text, type: String, desc: 'page text.'
        end
        post do
          begin
            book = Book.find(params[:book_id])
            if(book && book.owner == current_user) then
              book.pages.build(name: params[:page_name], text: params[:text]).save
              present true
            else
              error!("Unauthorized. You are not owner of the book.", 401)
            end
          rescue
            error!("Duplicate!", 500)
          end
        end

        desc 'Update a page data.'
        params do
          requires :book_id, type: Integer, desc: 'book id.'
          requires :page_name, type: String, desc: 'page name.'
          requires :text, type: String, desc: 'json of page'
        end
        put do
          begin
            book = Book.find(params[:book_id])
            if(book && book.owner == current_user) then
              book.pages.where(name: params[:page_name])&.update(text: params[:text])
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

module Resources
  module V1
    class Pages < Grape::API
      resource 'book/:book_name/pages' do
        desc 'Return pages data.'
        params do
          requires :book_name, type: String, desc: 'book name.'
        end
        get do
          present Book.find_by(name: params[:book_name])&.pages.map(&:name) || []
        end
      end

      resources 'book/:book_name/page/:page_name' do
        desc 'Return a page data.'
        params do
          requires :book_name, type: String, desc: 'book name.'
          requires :page_name, type: String, desc: 'page name.'
        end
        get do
          begin
            present Book.find_by(name: params[:book_name]).pages.where(name: params[:page_name]).take.text
          rescue
            error!("Not found!", 404)
          end
        end

        desc 'Create a page data.'
        params do
          requires :book_name, type: String, desc: 'book name.'
          requires :page_name, type: String, desc: 'page name.'
          requires :text, type: String, desc: 'page text.'
        end
        post do
          begin
            Book.find_by(name: params[:book_name]).pages.build(name: params[:page_name], text: params[:text]).save
            present true
          rescue
            error!("Duplicate!", 500)
          end
        end

        desc 'Update a page data.'
        params do
          requires :text, type: String, desc: 'json of page'
        end
        put do
          begin
            Book.find_by(name: params[:book_name])&.pages.where(name: params[:page_name])&.update(text: params[:text])
            present true
          rescue
            error!("Not found!", 404)
          end
        end
      end
    end
  end
end

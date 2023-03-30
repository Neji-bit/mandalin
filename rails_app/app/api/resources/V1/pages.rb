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

      helpers do
        # パラメータから「正常なID」を抽出する。
        def legal_params()
          _params = {}
          _params[:book_id] = params[:book_id]
          _params[:page_name] = params[:page_name] if params[:page_name]&.match?(/^[0-9a-f]$/)
          _params
        end
      end

      resources 'book/:book_id/page/:page_name' do
        # ページの find_or_create_by 挙動はここで行う。
        desc 'Return a page data.'
        route_setting :auth, disabled: true
        params do
          requires :book_id, type: Integer, desc: 'book id.'
          requires :page_name, type: String, desc: 'page name.'
        end
        get do
          begin
            _legal_params = legal_params
            # そもそもブックがない場合、エラー。
            # ページがない場合、ブックへの書き込み権限がある場合、新規作成。
            # ブック／ページがある場合、権限を判断。
            #   ブック／ページへのRead権限がない場合は、エラー。

            # 以下は仮コード。
            book = Book.find(_legal_params[:book_id])

            # app_infoを作成する。コードの重複あるので、後で整理する。
            json = JSON.parse(book.text)
            json["app_info"]["visitor_email"] = current_user ? current_user.email : nil
            json["app_info"]["is_owner"] = (current_user == book.owner)
            unless(json["app_info"]["is_owner"]) then
              unless(json["book"]["authorization"]["is_public"]) then
                raise
              end
            end

            page = nil
            if(book.owner == current_user) then
              page = Page.find_or_create_by(book: book, name: _legal_params[:page_name]) do |c|
                c.book = book
                c.name = _legal_params[:page_name]
              end
            else
              page = book.pages.where(name: _legal_params[:page_name])&.first
            end
            raise unless page
            present page.text
          rescue
            error!("Not found", 404)
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

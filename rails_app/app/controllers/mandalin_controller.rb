class MandalinController < ApplicationController
  before_action :authenticate_user!, except: :main
  def main
    book = Book.find_by(id: params[:book])
    unless book then
      redirect_to "/?book=1&open=1"
    else
      @read_only = true if book.owner != current_user
      @read_only = true unless book.owner
    end
  end
end

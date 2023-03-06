class MandalaController < ApplicationController
  before_action :authenticate_user!
  def main
    book = Book.find_by(id: params[:book])
    unless book then
      redirect_to "/mandala?book=1"
    else
      @read_only = true if book.owner != current_user
    end
  end
end

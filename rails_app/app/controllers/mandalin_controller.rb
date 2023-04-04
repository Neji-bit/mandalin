class MandalinController < ApplicationController
  before_action :authenticate_user!, except: :main
  before_action :legal_params

  DEFAULT_PATH = "/?book=1"

  def main
    # 正常なブックIDがパラメータで指定されていなければ、強制的に初期ブックへ遷移。
    unless(@legal_params[:book]) then
      redirect_to DEFAULT_PATH
      return
    end

    # ブックの状態を確認。
    #   対象のブックが存在する場合、権限を判定。
    #     権限がOKの場合、Webアプリを表示。
    #     権限がNGの場合、404ページへ遷移。
    #   対象のブックが存在しない場合、アカウントを判定。
    #     ブックの新規作成が可能な場合、Webアプリを表示。
    #     ブックの新規作成が不可な場合、404ページへ遷移。
    if(current_user) then
      Book.find_or_create_by!(id: @legal_params[:book]) {|b| b.name = ""; b.owner = current_user}  # これは仮コード。
    else
      unless(Book.find_by(id: @legal_params[:book])) then
        render_404
        return
      end
    end
    # message = "ログインしました。"
    # session[:_flash] = session[:_flash] || []
    # session[:_flash].push(message) unless session[:_flash].include?(message)
  end

  # パラメータから「正常なID」を抽出する。
  def legal_params
    @legal_params = {}
    @legal_params[:book] = params[:book].to_i if params[:book]&.match(/^[0-9]{1,4}$/) && 0 < params[:book].to_i
    @legal_params[:page] = params[:page] if params[:page]&.match?(/^[0-9a-f]$/)
  end

  def render_500
    render json: { error: "500 Internal Server Error" }, status: :internal_server_error
  end
  def render_404
    render json: { error: "404 Not Found" }, status: :not_found
  end
end

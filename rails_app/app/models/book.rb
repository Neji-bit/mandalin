class Book < ApplicationRecord
  belongs_to :owner, class_name: "User", foreign_key: :owner_id
  has_many :pages, dependent: :destroy

  def initialize(options = nil)
    super(options)
    # 生成時、初期データを設定する。
    File.open("#{Rails.root}/app/models/concerns/book_default.json") do |j|
      self.text = JSON.generate(JSON.load(j))
    end
  end
end

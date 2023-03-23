class Page < ApplicationRecord
  belongs_to :book

  def initialize(options = nil)
    super(options)
    # 生成時、初期データを設定する。
    File.open("#{Rails.root}/app/models/concerns/page_default.json") do |j|
      self.text = JSON.generate(JSON.load(j))
    end
  end
end

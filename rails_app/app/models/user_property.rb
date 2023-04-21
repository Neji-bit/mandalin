class UserProperty < ApplicationRecord
  belongs_to :user

  def initialize(options = nil)
    super(options)
    # 生成時、初期データを設定する。
    File.open("#{Rails.root}/app/models/concerns/user_property_default.json") do |j|
      self.text = JSON.generate(JSON.load(j))
    end
  end
end

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable, :lockable
  has_many :books, foreign_key: :owner_id
  has_one :property, class_name: "UserProperty", dependent: :destroy
  before_validation :build_property, on: :create

  # パスワードのバリデーション。小文字, 大文字, 数字, 記号を一つ以上、８文字
  VALID_PASSWORD_REGEX = /\A(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[\W_])[!-~]{8,}+\z/
  validates :password, format: { with: VALID_PASSWORD_REGEX }
end

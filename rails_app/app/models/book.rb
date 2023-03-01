class Book < ApplicationRecord
  has_many :pages, dependent: :destroy
end

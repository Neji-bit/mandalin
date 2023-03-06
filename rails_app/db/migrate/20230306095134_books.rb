class Books < ActiveRecord::Migration[7.0]
  def change
    add_column :books, :owner_id, :bigint, index: true, default: nil
    add_foreign_key :books, :users, column: :owner_id
  end
end

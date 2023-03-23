class CreateBooks < ActiveRecord::Migration[7.0]
  def change
    create_table :books do |t|
      t.string :name, null: false, index: true, default: ""
      t.text :text, null: false, default: ""
      t.bigint :owner_id, index: true, null: false

      t.timestamps
    end
    add_foreign_key :books, :users, column: :owner_id
  end
end

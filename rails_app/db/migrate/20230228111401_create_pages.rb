class CreatePages < ActiveRecord::Migration[7.0]
  def change
    create_table :pages do |t|
      t.string :name, null: false
      t.text :text, null: false
      t.references :book, null: false, foreign_key: true

      t.timestamps
      t.index [:book_id, :name], unique: true
    end
  end
end

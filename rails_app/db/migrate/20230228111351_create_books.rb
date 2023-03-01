class CreateBooks < ActiveRecord::Migration[7.0]
  def change
    create_table :books do |t|
      t.string :name, null: false, index: {unique: true}
      t.text :text, null: false

      t.timestamps
    end
  end
end

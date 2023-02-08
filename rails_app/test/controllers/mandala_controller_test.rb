require "test_helper"

class MandalaControllerTest < ActionDispatch::IntegrationTest
  test "should get main" do
    get mandala_main_url
    assert_response :success
  end
end

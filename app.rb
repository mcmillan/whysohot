require 'json'
require 'time'
require 'sinatra'
require 'mongoid'
require 'httparty'

if development?
  require 'sinatra/reloader'
  require 'dotenv'
  Dotenv.load
end

configure do
  Mongoid.load!('config/mongoid.yml')
end

class Reading
  include Mongoid::Document

  field :f35_temperature, type: Float
  field :outside_temperature, type: Float
  field :taken_at, type: DateTime

  def self.recent
    desc(:taken_at).limit(60)
  end
end

get '/' do
  erb :index
end

get '/readings.json' do
  content_type :json
  Reading.recent.to_json
end

post '/readings' do
  halt 401, 'Invalid API key' if params[:api_key] != ENV['API_KEY']

  reading = Reading.new

  reading.f35_temperature = params[:temperature]
  reading.taken_at = params[:taken_at] || Time.now
  reading.outside_temperature = HTTParty.get(
    "https://api.forecast.io/forecast/#{ENV['FORECAST_API_KEY']}/51.5501713,-0.0591910?units=si"
  ).parsed_response['currently']['temperature']
  reading.save

  201
end

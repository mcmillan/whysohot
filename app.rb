require 'json'
require 'time'
require 'redis'
require 'sinatra'

if development?
  require 'sinatra/reloader'
  require 'dotenv'
  Dotenv.load
end

Redis.new(url: ENV['REDIS_URL'])

class Reading
  LIST_NAME = 'readings'

  attr_accessor :temperature, :taken_at

  def self.all
    Redis.current.lrange(LIST_NAME, 0, -1).map { |r| from_json(r) }.reverse
  end

  def self.from_json(reading)
    reading = JSON.parse(reading)
    new(reading['temperature'], reading['taken_at'])
  end

  def initialize(temperature, taken_at = Time.now)
    @temperature, @taken_at = temperature, Time.parse(taken_at.to_s)
  end

  def to_json(*args)
    { temperature: temperature, taken_at: taken_at }.to_json(*args)
  end

  def save
    Redis.current.rpush(LIST_NAME, to_json)
  end
end

get '/readings' do
  content_type :json
  Reading.all.to_json
end

post '/readings' do
  halt 401, 'Invalid API key' if params[:api_key] != ENV['API_KEY']

  temperature = params[:temperature]
  taken_at = params[:taken_at] || Time.now

  reading = Reading.new(temperature, taken_at)
  reading.save

  201
end

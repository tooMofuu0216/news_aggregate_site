from gnews import GNews
import newspaper
from dotenv import dotenv_values
from pymongo import MongoClient, UpdateOne, DESCENDING
from datetime import datetime, timedelta

config = dotenv_values(".env")
mongodb_client = MongoClient(config["ATLAS_URI"])
db = mongodb_client[config["DB_NAME"]]
index_column = "published_date"
collection = db['News']

# index on publish date
existing_indexes = collection.index_information()
if f"{index_column}_1" not in existing_indexes:
    # Create the index if it doesn't exist
    collection.create_index([(index_column, DESCENDING)])

timestamp_format = '%a, %d %b %Y %H:%M:%S GMT'
topic_list = ['NATION', 'WORLD']
filter_publisher = ['新假期周刊', '巴士的報', '港生活', 'Bastille Post巴士的報', '中天電視']

google_news = GNews(country='HK',language='zh',start_date=datetime.now())
for topic in topic_list:
    bulk_operations = []
    news = google_news.get_news_by_topic(topic)

    for news_obj in news:
        if news_obj['publisher']['title'] in filter_publisher:
            continue
        news_obj[index_column] = datetime.strptime(news_obj["published date"], timestamp_format)
        article = google_news.get_full_article(news_obj['url'])
        news_obj['article'] = article.text if article is not None else ''
        news_obj['topic'] = topic
        
        filter_query = {"title": news_obj["title"]}
        update = {
            "$set": news_obj 
        }
        bulk_operations.append(UpdateOne(filter_query, update, upsert=True))
    
    result = collection.bulk_write(bulk_operations)
    print(f"Upserted {result.upserted_count} {topic} news")


# Calculate the date one week ago
one_week_ago = datetime.now() - timedelta(days=7)
result = collection.delete_many({
    index_column: {"$lt": one_week_ago}
})
print(f"Deleted {result.deleted_count} news")

# delete if publisher contain in filter_publisher
result = collection.delete_many({
    "publisher.title": {"$in": filter_publisher}
})
print(f"Deleted {result.deleted_count} news")

mongodb_client.close()
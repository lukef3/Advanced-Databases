import couchdb

server_url = r"http://admin:mtu1234@127.0.0.1:5984/"

db = couchdb.Server(server_url)['movies']

for doc_id in db:
    print(db[doc_id])

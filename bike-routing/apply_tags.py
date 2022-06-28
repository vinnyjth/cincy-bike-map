import osmium
import json

class TstStreetHandler(osmium.SimpleHandler):
    def __init__(self, writer, tst_data):
        super(TstStreetHandler, self).__init__()
        self.writer = writer
        self.tst_data = tst_data

    def node(self, n):
        self.writer.add_node(n)

    def relation(self, r):
        self.writer.add_relation(r)

    def way(self, w):
        for key in self.tst_data:
            for n in w.nodes:
                if n.ref in self.tst_data[key]:
                    new_tags = [tag for tag in w.tags]
                    new_tags.append((key, 'yes'))
                    self.writer.add_way(w.replace(tags=new_tags))
        else:
            self.writer.add_way(w)

def flatten(t):
    return [item for sublist in t for item in sublist]

f = open ('./tst_tagged_nodes.json', "r")
data = json.loads(f.read())
tst_data_quick = {}

for key in data:
    tst_data_quick[key] = set(flatten(data[key]))

print(tst_data_quick)    

writer = osmium.SimpleWriter('./oky-cincy-tagged.osm.pbf')
h = TstStreetHandler( writer, tst_data_quick)
h.apply_file("./oky-cincy.osm.pbf")
writer.close()




import osmium
import json

class TstStreetHandler(osmium.SimpleHandler):
    def __init__(self, writer, tst_node_data_quick, tst_way_data_quick):
        super(TstStreetHandler, self).__init__()
        self.writer = writer
        self.tst_node_data = tst_node_data_quick
        self.tst_way_data = tst_way_data_quick

    def node(self, n):
        self.writer.add_node(n)

    def relation(self, r):
        self.writer.add_relation(r)

    def way(self, w):
        for key in self.tst_node_data:
            for n in w.nodes:
                if n.ref in self.tst_node_data[key]:
                    new_tags = [tag for tag in w.tags]
                    new_tags.append((key, 'yes'))
                    self.writer.add_way(w.replace(tags=new_tags))
        for key in self.tst_way_data:                    
            if w.id in self.tst_way_data[key]:
                print("Found one")
                new_tags = [tag for tag in w.tags]
                new_tags.append((key, 'yes'))
                self.writer.add_way(w.replace(tags=new_tags))
        else:
            self.writer.add_way(w)

def flatten(t):
    return [item for sublist in t for item in sublist]

nf = open ('./tst_tagged_nodes.json', "r")
wf = open ('./tst_tagged_ways.json', "r")

node_data = json.loads(nf.read())
way_data = json.loads(wf.read())

tst_node_data_quick = {}
tst_way_data_quick = {}

for key in node_data:
    tst_node_data_quick[key] = set(flatten(node_data[key]))

for key in way_data:
    tst_way_data_quick[key] = set(flatten(way_data[key]))


writer = osmium.SimpleWriter('./oky-cincy-tagged.osm.pbf')
h = TstStreetHandler( writer, tst_node_data_quick, tst_way_data_quick)
h.apply_file("./oky-cincy.osm.pbf")
writer.close()




#coding=UTF-8
'''
Created on 2013-1-20

@author: yezi
'''

import os
import datetime

import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.options
import tornado.autoreload

from tornado.options import define, options

import pymongo

# 
define("port", default = 8000, type = int)
define("mongo_host", default = "127.0.0.1")
define("mongo_port", default = 27017, type = int)
define("mongo_database", default = "reunion")

class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", HomeHandler),
            (r"/reunion/([0-9]{4})", ReunionHandler),
        ]
        settings = dict(
            title = u"聚会",
            template_path = os.path.join(os.path.dirname(__file__), "template"),
            static_path = os.path.join(os.path.dirname(__file__), "static"),
            cookie_secret = "45.9"
        )
        
        tornado.web.Application.__init__(self, handlers, **settings)
        
        conn = pymongo.Connection(options.mongo_host, options.mongo_port)
        self.db = conn[options.mongo_database]
        

class BaseHandler(tornado.web.RequestHandler):
    @property
    def db(self):
        return self.application.db
    
#    @property
#    def collection(self):
#        return self.application.db

    def get_current_user(self):
        name = self.get_secure_cookie("user")
        if not name: return None
        return name


class HomeHandler(BaseHandler):
    def get(self):
        self.render("index.html", test = "test")

class ReunionHandler(BaseHandler):
    #@tornado.web.authenticated
    def get(self, year):
        cms = self.db[year].find({"type": "cm"})
        lys = self.db[year].find({"type": "ly"})
        self.render("reunion.html", cms = cms, lys = lys)
        
    #@tornado.web.authenticated
    def post(self, year):
        type = self.get_argument("type", "cm")
        if type == "cm":
            name = self.get_argument("name")
            phone = self.get_argument("phone", "")
            holiday_date = self.get_argument("holiday_date", "")
            home_date = self.get_argument("home_date", "")
            free_date = self.get_argument("free_date", "")
            reunion_date = self.get_argument("reunion_date", "")
            family = self.get_argument("family", "")
            remark = self.get_argument("remark", "")
            
            cm = self.db[year].find_one({"name" : name})
            print cm
            if not cm:
                cm = dict(
                    name = name,
                    phone = phone,
                    holiday_date = holiday_date,
                    home_date = home_date,
                    free_date = free_date,
                    reunion_date = reunion_date,
                    family = family,
                    remark = remark,
                    ctime = datetime.datetime.now(),
                    type = type
                )
            else:
                cm["phone"] = phone
                cm["holiday_date"] = holiday_date
                cm["home_date"] = home_date
                cm["free_date"] = free_date
                cm["reunion_date"] = reunion_date
                cm["family"] = family
                cm["remark"] = remark
            
            self.db[year].save(cm)
            self.set_secure_cookie("user", name)
        else:
            liuyan = self.get_argument("liuyan", "")
            if liuyan:
                self.db[year].save({"type": type, "liuyan": liuyan})
        
        self.write("ok")
    
def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.port)
    tornado.autoreload.start()
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()

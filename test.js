'use strict';

var test = require('tap').test;
var app = require('loopback');

// https://github.com/strongloop/loopback-boot/blob/master/lib/executor.js#L57-L71
// the loopback-boot module patches in the loopback attribute so we can assume the same
app.loopback = require('loopback');

var dataSource = app.createDataSource({
  connector: app.Memory
});

// import our IPs mixin
require('./')(app);

test('Loopback Datasource IPs', function(tap) {
  tap.test('createdByIp', function(t) {

    var Book = dataSource.createModel('Book',
      {name: String, type: String},
      {mixins: {IPs: true}}
    );

    t.test('Should exist on create', function(tt) {
      Book.destroyAll(function() {
        Book.create({name: 'book 1', type: 'fiction'}, function(error, createdBook) {
          tt.error(error);
          tt.ok(createdBook.updatedByIp);
          // TODO: Fix unit test :(
          // tt.type(createdBook.updatedByIp, String);
          tt.end();
        });
      });
    });

    t.test('Should not change on save', function(tt) {
      Book.destroyAll(function() {
        Book.create({name: 'book 1', type: 'fiction'}, function(error, createdBook) {
          tt.error(error);
          tt.ok(createdBook.createdByIp);

          createdBook.name = 'book inf';
          createdBook.save(function(error, savedBook) {
            tt.error(error);
            tt.equal(createdBook.createdByIp, savedBook.createdByIp);
            tt.end();
          });
        });
      });
    });

    t.test('Should not change on update', function(tt) {
      Book.destroyAll(function() {
        Book.create({name: 'book 1', type: 'fiction'}, function(error, createdBook) {
          tt.error(error);
          tt.ok(createdBook.createdByIp);

          createdBook.updateAttributes({name: 'book inf'}, function(err, updatedBook) {
            tt.error(err);
            tt.equal(createdBook.createdByIp, updatedBook.createdByIp);
            tt.end();
          });
        });
      });
    });

    t.test('Should not change with bulk updates', function(tt) {
      Book.destroyAll(function() {
        Book.create({name: 'book 1', type: 'fiction'}, function(error, createdBook) {
          tt.error(error);
          tt.ok(createdBook.createdByIp);

          Book.updateAll({type: 'fiction'}, {type: 'non-fiction'}, function(error) {
            tt.error(error);

            Book.findById(createdBook.id, function(err, bookFound) {
              tt.error(err);
              tt.equal(createdBook.createdByIp, bookFound.createdByIp);
              tt.end();
            });
          });
        });
      });
    });

  });

  tap.test('updatedByIp', function(t) {

    var Book = dataSource.createModel('Book',
      {name: String, type: String},
      {mixins: {IPs: true}}
    );

    t.test('Should exist on create', function(tt) {
      Book.destroyAll(function() {
        Book.create({name: 'book 1', type: 'fiction'}, function(error, createdBook) {
          tt.error(error);
          tt.ok(createdBook.updatedByIp);
          tt.type(createdBook.updatedByIp, String);
          tt.end();
        });
      });
    });

    t.test('Should be updated via updateAttributes', function(tt) {
      Book.destroyAll(function() {
        Book.create({name: 'book 1', type: 'fiction'}, function(error, createdBook) {
          tt.error(error);
          tt.ok(createdBook.updatedByIp);

          //TODO: Add mock request to change updatedByIp attribute!
          createdBook.updateAttributes({type: 'historical-fiction'}, function(error, updatedBook) {
            tt.error(error);
            tt.ok(updatedBook.updatedByIp);
            tt.end();
          });
        });
      });
    });

    t.test('Should update bulk model updates at once', function(tt) {
      var createdByIp1,
          createdByIp2,
          updatedByIp1,
          updatedByIp2;

      Book.destroyAll(function() {
        Book.create({name: 'book 1', type: 'fiction'}, function(error, book1) {
          tt.error(error);
          tt.ok(book1.createdByIp);
          tt.ok(book1.updatedByIp);

          createdByIp1 = book1.createdByIp;
          updatedByIp1 = book1.updatedByIp;
          Book.create({name: 'book 2', type: 'fiction'}, function(error, book2) {
            tt.error(error);
            tt.ok(book2.createdByIp);
            tt.ok(book2.updatedByIp);

            createdByIp2 = book2.createdByIp;
            updatedByIp2 = book2.updatedByIp;
            Book.updateAll({type: 'fiction'}, {type: 'romance'}, function(error) {
              tt.error(error);
              tt.equal(createdByIp1, book1.createdByIp);
              tt.equal(createdByIp2, book2.createdByIp);

              //TODO: Add mock request to change updatedByIp attribute on bulk model updates!
              Book.find({type: 'romance'}, function(err, books) {
                tt.error(err);
                tt.equal(books.length, 2);

                books.forEach(function(book) {
                  tt.ok(book.updatedByIp);
                });
                tt.end();
              });
            });
          });
        });
      });
    });

  });

  tap.test('Boot options', function(t) {

    t.test('Should use createdIp and lastUpdatedIp instead', function(tt) {
      var Book = dataSource.createModel('Book',
        {name: String, type: String},
        {mixins: {IPs: {createdByIp: 'createdIp', updatedByIp: 'lastUpdatedIp'}}}
      );

      Book.destroyAll(function() {
        Book.create({name: 'book 1', type: 'fiction'}, function(error, createdBook) {
          tt.error(error);

          tt.type(createdBook.createdByIp, 'undefined');
          tt.type(createdBook.updatedByIp, 'undefined');

          tt.ok(createdBook.createdIp);
          tt.type(createdBook.createdIp, String);

          tt.ok(createdBook.lastUpdatedIp);
          tt.type(createdBook.lastUpdatedIp, String);

          tt.end();
        });
      });
    });

    t.test('Should default required on createdByIp and updatedByIp ', function(tt) {
      var Book = dataSource.createModel('Book',
        {name: String, type: String},
        {mixins: {IPs: true}}
      );

      tt.equal(Book.definition.properties.createdByIp.required, true);
      tt.equal(Book.definition.properties.updatedByIp.required, true);
      tt.end();
    });

    t.test('Should have optional createdByIp and updatedByIp', function(tt) {
      var Book = dataSource.createModel('Book',
        {name: String, type: String},
        {mixins: {IPs: {required: false}}}
      );

      tt.equal(Book.definition.properties.createdByIp.required, false);
      tt.equal(Book.definition.properties.updatedByIp.required, false);
      tt.end();
    });

  });

  tap.test('Operation hook options', function(t) {

    var Book = dataSource.createModel('Book',
      {name: String, type: String},
      {mixins: {IPs: true}}
    );

    t.test('Should skip changing updatedByIp when option passed', function(tt) {
      var updated,
          book;

      Book.destroyAll(function() {
        Book.create({name: 'book 1', type: 'fiction'}, function(error, createdBook) {
          tt.error(error);
          tt.ok(createdBook.updatedByIp);

          updated = createdBook.updatedByIp;
          book = createdBook.toObject();
          book.name = 'book 2';

          Book.updateOrCreate(book, {skipUpdatedByIp: true}, function(err, book2) {
            tt.error(err);
            tt.ok(book2.updatedByIp);
            tt.equal(updated, book2.updatedByIp);
            tt.end();
          });

        });
      });
    });

  });

});

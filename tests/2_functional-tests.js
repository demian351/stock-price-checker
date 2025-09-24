const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  let testThreadId;
  let testReplyId;

  // 1. Crear un nuevo thread
  test('POST /api/threads/{board}', function (done) {
    chai.request(server)
      .post('/api/threads/test')
      .send({ text: 'test thread', delete_password: 'pass123' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'success');
        assert.property(res.body, 'thread_id');
        testThreadId = res.body.thread_id;
        done();
      });
  });

  // 2. Ver los 10 threads más recientes con 3 replies
  test('GET /api/threads/{board}', function (done) {
    chai.request(server)
      .get('/api/threads/test')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtMost(res.body.length, 10);
        if (res.body.length > 0) {
          assert.property(res.body[0], 'replies');
          assert.isAtMost(res.body[0].replies.length, 3);
        }
        done();
      });
  });

  // 3. Borrar un thread con contraseña incorrecta
  test('DELETE /api/threads/{board} wrong password', function (done) {
    chai.request(server)
      .delete('/api/threads/test')
      .send({ thread_id: testThreadId, delete_password: 'wrongpass' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  // 4. Reportar un thread
  test('PUT /api/threads/{board}', function (done) {
    chai.request(server)
      .put('/api/threads/test')
      .send({ thread_id: testThreadId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });

  // 5. Crear un nuevo reply
  test('POST /api/replies/{board}', function (done) {
    chai.request(server)
      .post('/api/replies/test')
      .send({ thread_id: testThreadId, text: 'test reply', delete_password: 'replypass' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'success');
        assert.property(res.body, 'reply_id');
        testReplyId = res.body.reply_id;
        done();
      });
  });

  // 6. Ver un thread con todos los replies
  test('GET /api/replies/{board}', function (done) {
    chai.request(server)
      .get('/api/replies/test')
      .query({ thread_id: testThreadId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'replies');
        assert.isArray(res.body.replies);
        assert.property(res.body.replies[0], 'text');
        done();
      });
  });

  // 7. Borrar un reply con contraseña incorrecta
  test('DELETE /api/replies/{board} wrong password', function (done) {
    chai.request(server)
      .delete('/api/replies/test')
      .send({ thread_id: testThreadId, reply_id: testReplyId, delete_password: 'badpass' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  // 8. Reportar un reply
  test('PUT /api/replies/{board}', function (done) {
    chai.request(server)
      .put('/api/replies/test')
      .send({ thread_id: testThreadId, reply_id: testReplyId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });

  // 9. Borrar un reply con contraseña correcta
  test('DELETE /api/replies/{board} correct password', function (done) {
    chai.request(server)
      .delete('/api/replies/test')
      .send({ thread_id: testThreadId, reply_id: testReplyId, delete_password: 'replypass' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

  // 10. Borrar un thread con contraseña correcta
  test('DELETE /api/threads/{board} correct password', function (done) {
    chai.request(server)
      .delete('/api/threads/test')
      .send({ thread_id: testThreadId, delete_password: 'pass123' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

});

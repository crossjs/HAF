import router from '../../../src/router'

describe('router', () => {
  it('should be object', () => {
    expect(router).to.be.an('object')
  })

  it('should call handler', done => {
    router.on('/', function () {
      expect(window.location.hash).to.equal('')
    })
    router.on('/a', function () {
      expect(window.location.hash).to.equal('#/a')
      done()
    })
    router.go('/')
    router.go('/a')
  })
})

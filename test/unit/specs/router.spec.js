import router from '../../../src/router'

const loc = window.location

router.start()

describe('router', () => {
  it('should call handler', done => {
    router.on('/', ({ path, query }) => {
      expect(path).to.equal('')
      expect(query).to.equal('x=1')
      // expect(loc.hash).to.equal('#/?x=1')
      router.go('/a?y=2')
    })
    router.on('/a', ({ path, query }) => {
      expect(path).to.equal('/a')
      expect(query).to.equal('y=2')
      expect(loc.hash).to.equal('#/a?y=2')
      router.go('/b?z=3')
    })
    router.on('/b', ({ path, query }) => {
      expect(path).to.equal('/b')
      expect(query).to.equal('z=3')
      expect(loc.hash).to.equal('#/b?z=3')
      done()
    })
    router.go('/?x=1')
  })
})

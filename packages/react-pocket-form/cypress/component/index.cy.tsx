import React from 'react'
import { mount } from 'cypress/react'
import { UseFormReturn } from '../../src'
import { useForm } from '../../src/index'

describe('cypress', () => {
  describe('unmount and remount input depending of a watched value', () => {
    type Form = {
      individual?: string
      company?: string
      status: 'individual' | 'company'
    }

    function Component(props: { methods: any; autoUnregister: boolean }) {
      const methods = useForm<Form>({ autoUnregister: props.autoUnregister })
      const { register, watch, errors } = methods

      Object.assign(props.methods, methods)

      const watched = watch('status', { defaultValue: 'individual' })
      const errs = errors()

      return (
        <form>
          {watched === 'individual' && (
            <>
              <input
                {...register('individual', {
                  validation: (v) => (v ? v.length > 4 : true),
                  message: 'individual error',
                })}
              />
              {errs?.individual && <p>{errs?.individual[0]}</p>}
            </>
          )}
          {watched === 'company' && (
            <>
              <input
                {...register('company', {
                  validation: (v) => (v ? v.length > 4 : true),
                  message: 'company error',
                })}
              />
              {errs?.company && <p>{errs?.company[0]}</p>}
            </>
          )}
          <input
            {...register('status', {
              type: 'radio',
              value: 'individual',
              defaultChecked: true,
            })}
          />
          <input
            {...register('status', {
              type: 'radio',
              value: 'company',
            })}
          />
        </form>
      )
    }

    it('autoUnregister=true', () => {
      const methods = cy.spy().as('methods') as unknown as UseFormReturn<Form>
      mount(<Component methods={methods} autoUnregister={true} />)

      cy.get('input[name="individual"]').should('exist')
      cy.get('input[name="company"]').should('not.exist')

      cy.get('[type="radio"]').check(['company'])

      cy.get('input[name="individual"]').should('not.exist')
      cy.get('input[name="company"]').should('exist')

      cy.get('[type="radio"]').check(['individual'])

      cy.get('input[name="individual"]').type('bar')

      cy.get('input[name="individual"]').should('exist')
      cy.get('input[name="company"]').should('not.exist')

      cy.get('[type="radio"]').check(['company'])
      cy.get('input[name="company"]').type('foo')

      cy.then(() => methods.handleSubmit()())

      cy.get('form').should('contain', 'company error')
      cy.get('form').should('not.contain', 'success')

      cy.get('input[name="company"]').type('foo')
      cy.get('form').should('not.contain', 'company error')

      cy.then(() =>
        methods.handleSubmit((data) => {
          expect(data).to.deep.equal({
            company: 'foofoo',
            status: 'company',
          })
        })()
      )
    })

    it('autoUnregister=false', () => {
      const methods = cy.spy().as('methods') as unknown as UseFormReturn<Form>
      mount(<Component methods={methods} autoUnregister={false} />)

      cy.get('input[name="individual"]').should('exist')
      cy.get('input[name="company"]').should('not.exist')

      cy.get('[type="radio"]').check(['company'])

      cy.get('input[name="individual"]').should('not.exist')
      cy.get('input[name="company"]').should('exist')

      cy.get('[type="radio"]').check(['individual'])

      cy.get('input[name="individual"]').type('bar')

      cy.get('input[name="individual"]').should('exist')
      cy.get('input[name="company"]').should('not.exist')

      cy.get('[type="radio"]').check(['company'])
      cy.get('input[name="company"]').type('foo')

      cy.then(() => methods.handleSubmit()())

      cy.get('form').should('contain', 'company error')
      cy.get('form').should('not.contain', 'success')

      cy.get('input[name="company"]').type('foo')
      cy.get('form').should('not.contain', 'company error')

      cy.then(() =>
        methods.handleSubmit((data) => {
          expect(data).to.deep.equal({
            individual: 'bar',
            company: 'foofoo',
            status: 'company',
          })
        })()
      )
    })
  })

  describe('unmount remount dirty with getValue', () => {
    type Form = {
      individual?: string
      company?: string
      status: 'individual' | 'company'
    }

    function Component(props: { methods: any; autoUnregister: boolean }) {
      const methods = useForm<Form>({ autoUnregister: props.autoUnregister })

      const { register, watch, errors } = methods

      Object.assign(props.methods, methods)

      const watched = watch('status', { defaultValue: 'individual' })
      const errs = errors()

      return (
        <form>
          {watched === 'individual' && (
            <>
              <input {...register('individual')} />
              {errs?.individual && <p>{errs?.individual[0]}</p>}
            </>
          )}
          <input
            {...register('status', {
              type: 'radio',
              value: 'company',
            })}
          />
          <input
            {...register('status', {
              type: 'radio',
              value: 'individual',
            })}
          />
        </form>
      )
    }

    it('autoUnregister=true', () => {
      const methods = cy.spy().as('methods') as unknown as UseFormReturn<Form>
      mount(<Component methods={methods} autoUnregister={true} />)

      cy.get('[type="radio"]').check(['individual'])
      cy.then(() => methods.setValue('individual', 'foo'))
      cy.get('[type="radio"]').check(['company'])
      cy.get('[type="radio"]').check(['individual'])
      cy.then(() =>
        methods.handleSubmit((data) => {
          expect(data).to.deep.equal({
            status: 'individual',
            individual: '',
          })
        })()
      )
    })

    it('autoUnregister=false', () => {
      const methods = cy.spy().as('methods') as unknown as UseFormReturn<Form>
      mount(<Component methods={methods} autoUnregister={false} />)

      cy.get('[type="radio"]').check(['individual'])
      cy.then(() => methods.setValue('individual', 'foo'))
      cy.get('[type="radio"]').check(['company'])
      cy.get('[type="radio"]').check(['individual'])
      cy.then(() =>
        methods.handleSubmit((data) => {
          expect(data).to.deep.equal({
            status: 'individual',
            individual: 'foo',
          })
        })()
      )
    })
  })

  describe('reste on sumbit', () => {
    type Form = {
      individual?: string
      company?: string
      status: 'individual' | 'company'
    }

    function Component(props: { methods: any; autoUnregister: boolean }) {
      const methods = useForm<Form>({ autoUnregister: props.autoUnregister })

      const { register, watch, errors } = methods

      Object.assign(props.methods, methods)

      const watched = watch('status', { defaultValue: 'individual' })
      const errs = errors()

      return (
        <form>
          {watched === 'individual' && (
            <>
              <input
                {...register('individual', {
                  validation: (v) => (v ? v.length > 4 : true),
                  message: 'individual error',
                })}
              />
              {errs?.individual && <p>{errs?.individual[0]}</p>}
            </>
          )}
          {watched === 'company' && (
            <>
              <input
                {...register('company', {
                  validation: (v) => (v ? v.length > 4 : true),
                  message: 'company error',
                })}
              />
              {errs?.company && <p>{errs?.company[0]}</p>}
            </>
          )}
          <input
            {...register('status', {
              type: 'radio',
              value: 'company',
            })}
          />
          <input
            {...register('status', {
              defaultChecked: true,
              type: 'radio',
              value: 'individual',
            })}
          />
        </form>
      )
    }

    it('', () => {
      const methods = cy.spy().as('methods') as unknown as UseFormReturn<Form>
      mount(<Component methods={methods} autoUnregister={true} />)

      cy.get('input[name="individual"]').type('bar')

      cy.then(() => methods.handleSubmit()())

      cy.get('form').should('contain', 'individual error')

      cy.get('input[name="individual"]').type('bar')

      cy.get('form').should('not.contain', 'individual error')

      cy.then(() =>
        methods.handleSubmit((data) => {
          expect(data).to.deep.equal({
            status: 'individual',
            individual: 'barbar',
          })
        })()
      )

      cy.get('[type="radio"]').check(['company'])

      cy.get('input[name="company"]').type('foo')

      cy.then(() => methods.handleSubmit()())

      cy.get('form').should('contain', 'company error')

      cy.get('input[name="company"]').type('foo')

      cy.get('form').should('not.contain', 'company error')

      cy.then(() =>
        methods.handleSubmit((data) => {
          expect(data).to.deep.equal({
            status: 'company',
            company: 'foofoo',
          })
        })()
      )
    })
  })
})

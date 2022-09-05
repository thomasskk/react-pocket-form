# react-pocket-form

---

- 1.9 kB gzipped
- Strongly typed
- Error re-render can be scoped to components
- Fully asynchronous
- Syntax is heavily inspired from [react-hook-form](https://github.com/react-hook-form/react-hook-form)

---

```ts
import { useForm } from 'react-pocket-form'

function Form() {
  const { register, handleSubmit, errors } = useForm<{
    age: number
    data: [{ id: string }]
  }>()

  const errs = errors()

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input
        {...register('age', {
          required: true,
          transform: Number,
          validation: (v) => v >= 18,
          message: 'You must be at least 18',
        })}
      />
      {errs.age && <p> {errs.age[0]} </p>}
      <input
        {...register('data.[0].id', {
          required: 'Your id is required.',
          transform: (v) => v.toUpperCase(),
        })}
      />
      {errs['data.[0].id'] && <p> {errs['data.[0].id'][0]} </p>}
      <button />
    </form>
  )
}
```

## Installation

```bash
npm i react-pocket-form
yarn add react-pocket-form
```

## UseForm

- `defaultValue`: The default form value.
- `autoUnregister`: Unset value when input unregister (default: false).
- `resetOnSubmit`: Reset all states on sumbit (default: true).
- `isValidation`: Manage global validation state (default: true).
- `validation`: Use custom resolver for validation.

#### register

- `required`: Using a string is equivalent to `true` and will modify the default error mesage which is "Field required". Can be used implicitly by using the attribute directly on the input. A field is considered empty when its value is : `undefined`, `null` or `''`. (default: false).
- `type`: (default: 'text').
- `defaultValue`
- `transform`: (event, value) => Promise.
- `onChange`: (event, value) => Promise.
- `onMount`: (event, value) => Promise.
- `onUnmount`: (event) => Promise.
- `onBlur`: (event, value) => Promise.
- `defaultChecked`: (default: false).
- `value`
- `validateOn` 'change' | 'blur' | 'submit' (default: 'submit').
- `revalidateOn` 'change' | 'submit' | 'blur' (default: 'submit').
- `validation` { fn: (v, values) => Promise, message?: string }[] | (v, values) => Promise.
- `message`: Validation Error message, must be used when validation is not an array.

#### errors

`() => string[] | undefined`

Hook which trigger a single re-render when there is a validation error at the specified path.
The size of the array of error depend on the size of the validation array (+1 if required is true)

```ts
import { useForm } form 'react-pocket-form'

const Component = () => {
  const { errors } = useForm<{id: number}>()
  const errs = errors()

  return <p>{errs.id[0]}</p>
}
```

#### error

`(path) => string[] | undefined`

Return a hook which trigger a single re-render when there is a validation error at the specified path.
The size of the array of error depend on the size of the validation array (+1 if required is true)

#### watch

`(path, opts?: { defaultValue }) => value`

Hook which return the watched value and trigger a single re-render when it change.

#### reset

#### getValue

#### setValue

#### getAllValue

#### setDefaultValue

## UseFormContext

Allow you to pass the form context to nested components.

```ts
import React from 'react'
import { useForm, FormProvider, useFormContext } from 'react-pocket-form'

function Form() {
  const methods = useForm()

  return (
    <FormProvider {...methods}>
      <form>
        <NestedInput />
      </form>
    </FormProvider>
  )
}

function NestedInput() {
  const { register, error } = useFormContext()
  return <input {...register('id')} />
}
```

import { EyeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EyeOffIcon } from 'lucide-react';
import InputMask from 'react-input-mask';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from './Modal'
import { z } from 'zod';
import ghLogo from '../imgs/gitHubLogo.png'

const validateSubmitSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().min(1).max(255).refine(value => /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi.test(value)),
  password: z.string().min(8).max(255),
  password_confirmation: z.string().min(8).max(255),
  phone: z.string().refine(value => /([(][0-9]{2}[)])\s[0-9]{5}-[0-9]{4}/.test(value)),
  cpf: z.string().refine(value => /(?!(\d)\1{2}.\1{3}.\1{3}-\1{2})\d{3}\.\d{3}\.\d{3}-\d{2}/.test(value)),
  zipcode: z.string().refine(value => /^\d{5}[-]\d{3}$/.test(value)),
  address: z.string().min(1).max(255),
  city: z.string().min(1),
  terms: z.boolean().refine(val => val === true)
}).refine((data) => data.password === data.password_confirmation, {
  path: ["password_confirmation"],
});

export default function Form() {
  const { register, formState: { errors }, handleSubmit } = useForm(
    { resolver: zodResolver(validateSubmitSchema) }
  )
  const [showPass, setShowPass] = useState('')
  const [cep, setCep] = useState('')
  const cepRegex = /^\d{5}[-]\d{3}$/
  const [cepObject, setCepObject] = useState('')
  const [modalActive, setModalActive] = useState('');
  const [submitOk, setSubmitOk] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Novo state para controlar o envio

  const handleValidateSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('https://apis.codante.io/api/register-user/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

      if (!response.ok) {
        handleModalActive(); // tratar erro
      }

      await response.json();
      response.ok === false ?
        (handleModalActive(response.ok), setIsSubmitting(false))
        :
        (handleModalActive(response.ok), setIsSubmitting(false));
    }
    catch (error) {
      handleModalActive();
      console.log("Enviou e Deu ruim", error);
    }
  }

  function handleShowPass() {
    setShowPass(showPass === true ? false : true);
  }

  function handleCep(e) {
    setCep(e.target.value)
  }

  function searchCep() {
    fetch(`https://viacep.com.br/ws/${cep}/json/`).then(res => res.json()).then(data => {
      data.erro ? errorCep() : setCepObject(data)
    })
    errors.cep = undefined
  }

  function errorCep() {
    setCepObject('')
    errors.cep = true
  }

  useEffect(() => cepRegex.test(cep) ? searchCep() : errorCep(), [cep])

  function handleModalActive(props) {
    setSubmitOk(props);
    setModalActive(() => modalActive === true ? false : true)
  }

  return (
    <>
      <Modal isActive={modalActive} isSubmitOk={submitOk}>
        <button onClick={handleModalActive} className="bg-gray-500 mx-auto mt-3 p-2 w-28 bg-slate-500 font-semibold text-white rounded-xl hover:bg-slate-600 transition-colors">fechar</button>
      </Modal>

      <form onSubmit={handleSubmit(handleValidateSubmit)}>

        <div className="mb-4">
          <label htmlFor="nameInput">Nome Completo</label>
          <input type="text" id='nameInput' {...register('name')} />
          {errors.name && <p className='text-red-400 text-sm'>O nome é obrigatório.</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="emailInput">E-mail</label>
          <input type="email" id="emailInput" {...register('email')} />
          {errors.email && <p className='text-red-400 text-sm'>Email inválido.</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="passwordInput">Senha</label>
          <div className="relative">
            <input type={showPass === true ? "text" : "password"} id="passwordInput" {...register('password')} />
            <span className="absolute right-3 top-3">
              {
                showPass === true ?
                  <button type='button' onClick={handleShowPass}>
                    <EyeIcon size={20} className="text-slate-600 cursor-pointer" />
                  </button>
                  :
                  <button type='button' onClick={handleShowPass}>
                    <EyeOffIcon
                      className="text-slate-600 cursor-pointer"
                      size={20}
                    />
                  </button>
              }
            </span>
            {errors.password && <p className='text-red-400 text-sm'>A senha deve conter pelo menos 8 caracteres.</p>}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="confirmPasswordInput">Confirmar Senha</label>
          <div className="relative">
            <input type={showPass === true ? "text" : "password"} id="confirmPasswordInput" {...register('password_confirmation')} />
            <span className="absolute right-3 top-3">
              {
                showPass === true ?
                  <button type='button' onClick={handleShowPass}>
                    <EyeIcon size={20} className="text-slate-600 cursor-pointer" />
                  </button>
                  :
                  <button type='button' onClick={handleShowPass}>
                    <EyeOffIcon
                      className="text-slate-600 cursor-pointer"
                      size={20}
                    />
                  </button>
              }
            </span>
            {errors.password_confirmation && <p className='text-red-400 text-sm'>As senhas não são iguais.</p>}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="phoneInput">Telefone Celular</label>
          <InputMask mask="(99) 99999-9999" type="text" id="phoneInput" {...register('phone')} />
          {errors.phone && <p className='text-red-400 text-sm'>Telefone inválido.</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="cpfInput">CPF válido</label>
          <InputMask mask="999.999.999-99" type="text" id="cpfInput" {...register('cpf')} />
          {errors.cpf && <p className='text-red-400 text-sm'>CPF inválido.</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="cepInput">CEP</label>
          <InputMask mask="99999-999" type="text" id="cepInput" {...register('zipcode')} onChange={handleCep} />
          {errors.zipcode && <p className='text-red-400 text-sm'>CEP inválido.</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="addressInput">Endereço</label>
          <input
            className="disabled:bg-slate-200"
            type="text"
            id="addressInput"
            {...register('address')}
          />
          {errors.address && <p className='text-red-400 text-sm'>Insira seu endereço.</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="cityInput">Cidade</label>
          <input
            className="disabled:bg-slate-200"
            type="text"
            id="cityInput"
            value={cepObject ? cepObject.localidade : ''}
            readOnly
            {...register('city')}
          />
          {errors.city && <p className='text-red-400 text-sm'>Cidade não encontrada.</p>}
        </div>

        <div className="mb-4">
          <input type="checkbox" id="termsInput" className="mr-2 accent-slate-500" {...register('terms')} />
          <label
            className="text-sm  font-light text-slate-500 mb-1 inline"
            htmlFor="termsInput"
          >
            Aceito os{' '}
            <span className="underline hover:text-slate-900 cursor-pointer">
              termos e condições
              {errors.terms && <p className='text-red-400 text-sm'>É necessário aceitar os termos e condições.</p>}

            </span>
          </label>
        </div>

        {
          isSubmitting === true ? <button
            type="submit"
            className="bg-slate-900 font-semibold text-white w-full rounded-xl p-4 mt-10"
            disabled
          >
            Enviando...
          </button>
            :
            <button
              type="submit"
              className="bg-slate-500 font-semibold text-white w-full rounded-xl p-4 mt-10 hover:bg-slate-600 transition-colors"
            >
              Cadastrar
            </button>}

      </form >
      <section>
        <a
          href="https://github.com/gabriel-leonel"
          target="_blank"
          className="fixed bottom-4 right-4"
        >
          <img
            src={ghLogo}
            alt="Link GitHub"
            className="w-10 h-10"
          />
        </a>
      </section>
    </>
  );
}

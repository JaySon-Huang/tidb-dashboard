import * as singleSpa from 'single-spa'
import React from 'react'
import { Form, Icon, Input, Button, message } from 'antd'
import { motion } from 'framer-motion'
import { withTranslation } from 'react-i18next'
import LanguageDropdown from '@/components/LanguageDropdown'
import client from '@pingcap-incubator/dashboard_client'
import * as authUtil from '@/utils/auth'

import { ReactComponent as Logo } from './logo.svg'
import styles from './RootComponent.module.less'

const AnimationItem = props => {
  return (
    <motion.div
      variants={{ open: { y: 0, opacity: 1 }, initial: { y: 50, opacity: 0 } }}
      transition={{ ease: 'easeOut' }}
    >
      {props.children}
    </motion.div>
  )
}

@Form.create({ name: 'tidb_signin' })
@withTranslation()
class TiDBSignInForm extends React.PureComponent {
  state = {
    loading: false,
    signInError: null,
  }

  constructor(props) {
    super(props)
    this.refPassword = React.createRef()
  }

  signIn = async form => {
    this.setState({ loading: true })
    this.clearErrorMessages()

    try {
      const r = await client.getInstance().userLoginPost({
        username: form.username,
        password: form.password,
        is_tidb_auth: true,
      })
      authUtil.setAuthToken(r.data.token)
      message.success(this.props.t('signin.message.success'))
      singleSpa.navigateToUrl('#' + this.props.registry.getDefaultRouter())
    } catch (e) {
      console.log(e)
      if (!e.handled) {
        let msg
        if (e.response.data) {
          msg = this.props.t(e.response.data.code)
        } else {
          msg = e.message
        }
        this.setState({
          signInError: this.props.t('signin.message.error', { msg }),
        })
        this.props.form.setFieldsValue({ password: '' })
        setTimeout(() => {
          // Focus after disable state is removed
          this.refPassword.current.focus()
        }, 0)
      }
    }
    this.setState({ loading: false })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (err) {
        return
      }
      this.signIn(values)
    })
  }

  clearErrorMessages = () => {
    this.setState({ signInError: null })
  }

  componentDidMount = () => {
    this.refPassword.current.focus()
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { t } = this.props
    return (
      <Form onSubmit={this.handleSubmit} layout="vertical">
        <motion.div
          initial="initial"
          animate="open"
          variants={{
            open: { transition: { staggerChildren: 0.03, delayChildren: 0.5 } },
          }}
        >
          <AnimationItem>
            <Logo className={styles.logo} />
          </AnimationItem>
          <AnimationItem>
            <Form.Item>
              <h2>{t('signin.form.tidb_auth.title')}</h2>
            </Form.Item>
          </AnimationItem>
          <AnimationItem>
            <Form.Item label={t('signin.form.username')}>
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: t('signin.form.tidb_auth.check.username'),
                  },
                ],
                initialValue: 'root',
              })(
                <Input
                  onInput={this.clearErrorMessages}
                  prefix={<Icon type="user" />}
                  disabled
                />
              )}
            </Form.Item>
          </AnimationItem>
          <AnimationItem>
            <Form.Item
              label={t('signin.form.password')}
              {...(this.state.signInError && {
                help: this.state.signInError,
                validateStatus: 'error',
              })}
            >
              {getFieldDecorator('password')(
                <Input
                  prefix={<Icon type="lock" />}
                  type="password"
                  disabled={this.state.loading}
                  onInput={this.clearErrorMessages}
                  ref={this.refPassword}
                />
              )}
            </Form.Item>
          </AnimationItem>
          <AnimationItem>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={this.state.loading}
                className={styles.signInButton}
                block
              >
                {t('signin.form.button')}
              </Button>
            </Form.Item>
          </AnimationItem>
          <AnimationItem>
            <div className={styles.extraLink}>
              <LanguageDropdown>
                <a>
                  <Icon type="global" /> Switch Language <Icon type="down" />
                </a>
              </LanguageDropdown>
            </div>
          </AnimationItem>
        </motion.div>
      </Form>
    )
  }
}

@withTranslation()
class App extends React.PureComponent {
  render() {
    const { registry } = this.props
    return (
      <div className={styles.container}>
        <div className={styles.dialogContainer}>
          <div className={styles.dialog}>
            <TiDBSignInForm registry={registry} />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ease: 'easeOut', duration: 0.5 }}
          className={styles.landing}
        ></motion.div>
      </div>
    )
  }
}

export default App

// DataStore is mostly recommended for use in the browser
import {
  DataStore,
  Schema,
  utils
} from 'js-data'
const HttpAdapter = require('js-data-http')

declare var require: any

const schemas = require('../../../_shared/schemas')(Schema)
const relations = require('../../../_shared/relations')

export const adapter = new HttpAdapter({
  // Our API sits behind the /api path
  basePath: '/api'
})
export const store = new DataStore()

store.registerAdapter('http', adapter, { default: true })

export interface IUser extends JSData.Record {
  id: string|number
  displayName: string
  username: string
  created_at: Date
  updated_at: Date
}

export interface IUserMapper extends JSData.Mapper {
  loggedInUser: IUser
  getLoggedInUser(): Promise<IUser>
}

// The User Resource
store.defineMapper('user', {
  // Our API endpoints use plural form in the path
  endpoint: 'users',
  schema: schemas.user,
  relations: relations.user,
  getLoggedInUser (): Promise<IUser> {
    if (this.loggedInUser) {
      return utils.resolve(this.loggedInUser)
    }
    return store.getAdapter('http').GET('/api/users/loggedInUser')
      .then((response) => {
        const user = this.loggedInUser = response.data
        if (user) {
          this.loggedInUser = <IUser>store.add('user', user)
        }
        return this.loggedInUser
      })
  }
})

export interface IPost extends JSData.Record {
  id: string|number
  title: string
  content: string
  user_id: string
  created_at: Date
  updated_at: Date
}

// The Post Resource
store.defineMapper('post', {
  // Our API endpoints use plural form in the path
  endpoint: 'posts',
  schema: schemas.post,
  relations: relations.post
})

export interface IComment extends JSData.Record {
  id: string|number
  user_id: string
  post_id: string
  created_at: Date
  updated_at: Date
}

// The Comment Resource
store.defineMapper('comment', {
  // Our API endpoints use plural form in the path
  endpoint: 'comments',
  schema: schemas.comment,
  relations: relations.comment
})

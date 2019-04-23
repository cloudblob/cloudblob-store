import {S3} from 'aws-sdk'


class StorageBackend {

  constructor(params={}) {
    this._config = Object.assign({}, params)
  }

  initConnection = () => {
    this._connection = this._getConnection(this._config)
  }

  _buildKey = (namespace, key, parent=null) => {
    const filename = 'entity.json'
    
    let pre = [namespace, key, filename]
    if (parent)
      pre = [namespace, parent, key, filename]

    return pre.join("/")
  }
}

class AWS extends StorageBackend {

  _getConnection = (config) => {
    return new S3(config)
  }

  readDoc = (bucket, key) => {
    return this._connection.getObject({Key: key, Bucket: bucket}).promise()
      .then((data) => {
        return JSON.parse(Buffer.from(data.Body).toString())
      }).catch((err) => {
        console.log("Could not read file: "+err)
        return {}
      })
  }

  writeDoc = (bucket, key, doc) => {
    const Body = JSON.stringify(doc).toString('hex')
    return this._connection.putObject({Key: key, Bucket: bucket, Body}).promise()
      .then((data) => {
        // if (data.ETag)
        return doc
      }).catch((err) => {
        console.log("Could not write file: "+err)
        return {}
      })
  }

  listDocs = (bucket, namespace, max) => {
    return this._connection.listObjectsV2({Bucket: bucket, Prefix: namespace, MaxKeys:max}).promise()
      .then(data => {
        return {
          next: data.NextContinuationToken, 
          results: data.Contents.map(item => item.Key)
        }
      })
  }
}

class Azure extends StorageBackend {

}

class Google extends StorageBackend {

}


export {
  StorageBackend, AWS, Google, Azure
}
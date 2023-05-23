/**** in-memory storage adapter ****/

  const InMemoryStorage = Object.create(null)

  GUN.on('create', function (Context) {        // do not use a "fat arrow" here!
    this.to.next(Context)

    if (Context.opt.inMemory != true) { return }     // adapter wasn't requested

  /**** get - retrieve the contents of a given node ****/

    Context.on('get', function (WireMessage) {           // no "fat arrow" here!
      this.to.next(WireMessage)

      let DedupId = WireMessage['#']
      let LEX     = WireMessage.get
      let Soul    = (LEX == null ? undefined : LEX['#'])
      if (Soul == null) { return }

      let StorageKey = md5(Soul)

      let Data = InMemoryStorage[StorageKey]        // fetches data from storage
      if (Data == null) {
        Context.on('in', { '@':DedupId, err:null, put:null })
      } else {
        try {
          let NodeSet = JSON.parse(Data)          // protects against collisions
          Data = NodeSet[Soul]

          let Key = LEX['.']
          if ((Key != null) && ! Object.plain(Key)) {
            Data = GUN.state.ify(
              {}, Key, GUN.state.is(Data,Key), Data[Key], Soul
            )
          }

          Context.on('in', { '@':DedupId, ok:1, err:null, put:Data })
        } catch (Signal) {
          Error = 'localStorage failure: ' + Signal + (
            Signal.stack == null ? '' : '' + Signal.stack
          )
          Context.on('in', { '@':DedupId, err:Error, put:null })
        }
      }
    })

  /**** put - patches the contents of a given node ****/

    Context.on('put', function (WireMessage) {           // no "fat arrow" here!
      this.to.next(WireMessage)

      let LEX     = WireMessage.put
      let Soul    = LEX['#'], Key  = LEX['.']
      let DedupId = WireMessage['#']
      let Ok      = WireMessage.ok || ''

      let StorageKey = md5(Soul)

      let Data = InMemoryStorage[StorageKey]        // fetches data from storage
      try {
        let NodeSet = JSON.parse(Data || '{}')
          NodeSet[Soul] = GUN.state.ify(         // merges new data into storage
            NodeSet[Soul], Key, LEX['>'], LEX[':'], Soul
          )
        InMemoryStorage[StorageKey] = JSON.stringify(NodeSet)

        Context.on('in', { '@':DedupId, err:null, ok:true })
      } catch (Signal) {
        Error = 'localStorage failure: ' + Signal + (
          Signal.stack == null ? '' : '' + Signal.stack
        )
        Context.on('in', { '@':DedupId, err:Error, ok:false })
      }
    })
  })


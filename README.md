# gundb-indirect-in-memory-storage-adapter #

GunDB storage adapter demonstrator handling arbitrarily long node ids

The ids of nodes in a [GunDB](https://github.com/amark/gun) can get arbitrarily long. This makes it difficult for storage adapters to use these ids as file names. This storage adapter therefore simply demonstrates how to use MD5 hashes of node ids instead of the ids themselves in order to determine where to store a node's contents.

> Nota bene: do not use this adapter for anything else but a test of its underlying concept!

> **Important: after two weeks of intensive work and no substantial outcome, I have decided to give up on GunDB - it is full of design flaws, bugs and - even worse - race conditions and the implementation looks like being hacked in a style used 40 years ago (when source code had to be compact and variable names short and objects to be returned by reference because of performance constraints)**
> 
> **I wish everbody working with and on GunDB good luck - but will no longer participate myself**
>
> **Nevertheless, you may still use my contributions in any way you like - they are MIT licensed**

## Usage ##

Load [blueimp](https://github.com/blueimp)'s [JavaScript implementation of md5](https://github.com/blueimp/JavaScript-MD5) (or any other variant) into your web page and copy the contents of file [indirectInMemoryStorageAdapter.js](./src/indirectInMemoryStorageAdapter.js) into a `<script>` element and add it to the `<head>` section of your HTML document right after the one for GunDB itself.

```
<script src="https://cdn.jsdelivr.net/npm/blueimp-md5/js/md5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>
<script>
  ... insert source code here
</script>
```

Then, create your GunDB instance with the following options (among others, if need be):

```
  const Gun = GUN({ localStorage:false, inMemory:true })
```

Your GunDB instance should now run as usual - but if you look into the `InMemoryStorage` variable you will see that any nodes will be stored under a their MD5 hash as key.

From here, it will be quite simple to map these keys onto a file system path. Here is a suggestion:

* since the MD5 hash is a string, use the first two characters as the outer folder name,
* then use the next two characters as the name of an inner folder (within the outer one),
* finally store the node descriptor built by the `indirectInMemoryStorageAdapter` within the inner folder under the MD5 key as its name and (perhaps) with `.json` as the file name suffix

Using this approach will avoid having to deal with a single folder containg thousands or millions of files. Instead, you will end up with

* 256 outer folders,
* 256 inner folders and approximately
* NodeCount/65536 files

where `NodeCount` is the total number of persisted nodes. This calculation assumes that MD5 hashes are equally distributed (what they do pretty well)

## License ##

[MIT License](LICENSE.md)

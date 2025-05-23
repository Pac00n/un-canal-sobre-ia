'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminNoticias() {
  const router = useRouter()
  // Solo crear el cliente de Supabase en el navegador, no durante el build
  const [supabase, setSupabase] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [noticias, setNoticias] = useState<any[]>([])
  const [error, setError] = useState('')

  // Estados para el formulario
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source_url: '',
    image_url: '',
    is_featured: false,
  })
  const [urlToGenerate, setUrlToGenerate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Función para generar artículo con IA
  const generateArticle = async () => {
    if (!urlToGenerate) {
      setError('Por favor, introduce una URL para generar el artículo')
      return
    }
    
    setIsGenerating(true)
    setError('')
    
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToGenerate }),
      })
      
      if (!response.ok) {
        throw new Error('Error al generar el artículo')
      }
      
      const data = await response.json()
      
      // Actualizar el formulario con los datos generados
      setFormData({
        title: data.title || '',
        content: data.content || '',
        source_url: urlToGenerate,
        image_url: '',
        is_featured: false,
      })
      
      setUrlToGenerate('')
    } catch (error) {
      console.error('Error:', error)
      setError('Error al generar el artículo. Inténtalo de nuevo.')
    } finally {
      setIsGenerating(false)
    }
  }
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  // Comprobar autenticación al cargar
  // Inicializar Supabase solo en el navegador
  useEffect(() => {
    // Esto solo se ejecuta en el lado del cliente
    if (typeof window !== 'undefined') {
      setSupabase(createClient())
    }
  }, [])
  
  // Verificar autenticación cuando supabase esté disponible
  useEffect(() => {
    if (supabase) {
      checkAuth()
    }
  }, [supabase])

  // Función para verificar autenticación
  const checkAuth = async () => {
    if (typeof window !== 'undefined' && supabase) {
      const saved = sessionStorage.getItem('isAdmin')
      if (saved === 'true') {
        setIsAuthenticated(true)
        fetchNoticias()
      }
    }
  }

  // Funciones de autenticación simple
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Contraseña simple para administradores - en producción usar auth más robusta
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin1234'
    
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('isAdmin', 'true')
      setIsAuthenticated(true)
      fetchNoticias()
    } else {
      setError('Contraseña incorrecta')
    }
    
    setIsLoading(false)
  }

  // Funciones CRUD para noticias
  const fetchNoticias = async () => {
    if (!supabase) return
    
    setIsLoading(true)
    
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching news:', error)
      setError('Error al cargar noticias')
    } else {
      setNoticias(data || [])
    }
    
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return formData.image_url
    if (!supabase) return formData.image_url

    try {
      // Comprobar si el bucket existe o crearlo
      const { data: buckets } = await supabase.storage.listBuckets()
    if (!buckets || !buckets.find((b: any) => b.name === 'news-images')) {
        console.log('Creando bucket news-images...')
        const { error: bucketError } = await supabase.storage.createBucket('news-images', {
          public: true
        })
        if (bucketError) {
          console.error('Error creando bucket:', bucketError)
          throw bucketError
        }
      }

      const fileName = `${Date.now()}-${imageFile.name}`
      const { data, error } = await supabase.storage
        .from('news-images')
        .upload(`noticias/${fileName}`, imageFile)

      if (error) {
        console.error('Error uploading image:', error)
        throw error
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(`noticias/${fileName}`)

      return publicUrl
    } catch (err) {
      console.error('Error en el proceso de subida de imagen:', err)
      return '' // Devolver string vacío si hay error
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!supabase) {
      setError('No se ha podido conectar con la base de datos')
      setIsLoading(false)
      return
    }

    try {
      // Subir imagen si existe
      const imageUrl = imageFile ? await uploadImage() : formData.image_url

      const newsData = {
        ...formData,
        image_url: imageUrl,
      }

      let result
      
      if (isEditing && currentId) {
        // Actualizar noticia existente
        result = await supabase
          .from('news')
          .update(newsData)
          .eq('id', currentId)
      } else {
        // Crear nueva noticia
        result = await supabase
          .from('news')
          .insert([newsData])
      }

      if (result.error) throw result.error

      // Resetear formulario y recargar noticias
      setFormData({
        title: '',
        content: '',
        source_url: '',
        image_url: '',
        is_featured: false,
      })
      setImageFile(null)
      setIsEditing(false)
      setCurrentId(null)
      
      // Revalidar la ruta de noticias para actualizar en el frontal
      try {
        await fetch('/api/revalidate?path=/noticias')
      } catch (revalidateError) {
        console.error('Error revalidando:', revalidateError)
      }
      
      fetchNoticias()
    } catch (err) {
      console.error('Error saving news:', err)
      setError('Error al guardar la noticia')
    }
    
    setIsLoading(false)
  }

  const handleEdit = (noticia: any) => {
    setFormData({
      title: noticia.title,
      content: noticia.content,
      source_url: noticia.source_url,
      image_url: noticia.image_url,
      is_featured: noticia.is_featured || false,
    })
    setCurrentId(noticia.id)
    setIsEditing(true)
    
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta noticia?')) return
    if (!supabase) {
      setError('No se ha podido conectar con la base de datos')
      return
    }
    
    setIsLoading(true)
    
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting news:', error)
      setError('Error al eliminar la noticia')
    } else {
      // Revalidar la ruta de noticias
      await fetch('/api/revalidate?path=/noticias')
      fetchNoticias()
    }
    
    setIsLoading(false)
  }

  // Pantalla de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto bg-white p-8 rounded-lg shadow">
          <h2 className="text-center text-2xl font-bold mb-6">Admin de Noticias</h2>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading ? 'Accediendo...' : 'Acceder'}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de administración (solo para usuarios autenticados)
  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin de Noticias</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Generador de artículos con IA */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Generar Artículo con IA</h2>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <input
              type="url"
              placeholder="Pega aquí la URL del artículo original"
              value={urlToGenerate}
              onChange={(e) => setUrlToGenerate(e.target.value)}
              className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <button
              onClick={generateArticle}
              disabled={isGenerating || !urlToGenerate}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {isGenerating ? 'Generando...' : 'Generar Contenido'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Pega una URL y la IA generará un artículo completo para ti.</p>
        </div>
        
        {/* Formulario de creación/edición de noticias */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Editar Noticia' : 'Crear Nueva Noticia'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
            
            <div>
              <label htmlFor="source_url" className="block text-sm font-medium text-gray-700">
                URL de la fuente
              </label>
              <input
                id="source_url"
                name="source_url"
                type="url"
                value={formData.source_url}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/articulo"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Contenido *
              </label>
              <textarea
                id="content"
                name="content"
                rows={6}
                required
                value={formData.content}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Imagen
              </label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full py-2"
              />
              {formData.image_url && !imageFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Imagen actual:</p>
                  <img 
                    src={formData.image_url} 
                    alt="Vista previa" 
                    className="mt-1 h-20 object-cover rounded"
                  />
                </div>
              )}
              {imageFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Nueva imagen:</p>
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Vista previa" 
                    className="mt-1 h-20 object-cover rounded"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                id="is_featured"
                name="is_featured"
                type="checkbox"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                Destacar esta noticia
              </label>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <button
                type="submit"
                disabled={isLoading}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      title: '',
                      content: '',
                      source_url: '',
                      image_url: '',
                      is_featured: false,
                    })
                    setImageFile(null)
                    setIsEditing(false)
                    setCurrentId(null)
                  }}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Lista de noticias existentes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Noticias Existentes</h2>
          
          {isLoading && <p className="text-gray-500">Cargando noticias...</p>}
          
          {!isLoading && noticias.length === 0 && (
            <p className="text-gray-500">No hay noticias disponibles.</p>
          )}
          
          <div className="space-y-4">
            {noticias.map((noticia) => (
              <div key={noticia.id} className="border-b pb-4">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{noticia.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(noticia.created_at).toLocaleDateString()}
                    </p>
                    <p className="mt-2 line-clamp-2">{noticia.content}</p>
                    {noticia.is_featured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                        Destacada
                      </span>
                    )}
                  </div>
                  
                  {noticia.image_url && (
                    <img 
                      src={noticia.image_url} 
                      alt={noticia.title} 
                      className="h-20 w-20 object-cover rounded mt-3 sm:mt-0 sm:ml-4"
                    />
                  )}
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleEdit(noticia)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(noticia.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                  {noticia.source_url && (
                    <a
                      href={noticia.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Ver fuente
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { ExternalLink, Users, RefreshCw, MapPin, Building2, Star } from 'lucide-react'

interface Member {
  id: string
  github_id: string
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  role: string
  bio: string | null
  company: string | null
  location: string | null
  email: string | null
  followers: number
  public_repos: number
}

export default function GitHubMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const data = await api.getGitHubMembers()
      setMembers(data)
    } catch (error) { console.error(error) }
    finally { setIsLoading(false) }
  }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">{members.length} organization members</p>
        </div>
        <button onClick={loadData} className="btn-secondary"><RefreshCw size={16} /> Refresh</button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="card"><div className="card-content flex items-center gap-4"><div className="h-12 w-12 skeleton rounded-full" /><div className="flex-1"><div className="h-4 w-32 skeleton rounded mb-2" /><div className="h-3 w-24 skeleton rounded" /></div></div></div>)}
        </div>
      ) : members.length === 0 ? (
        <div className="card">
          <div className="card-content text-center py-12">
            <Users size={48} className="mx-auto text-surface-300 mb-4" />
            <h3 className="text-lg font-medium text-surface-900">No members found</h3>
            <p className="text-sm text-surface-500 mt-1">Run a sync to fetch organization members</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => (
            <a key={member.id} href={member.html_url} target="_blank" rel="noopener noreferrer" className="card hover:shadow-medium transition-shadow group">
              <div className="card-content">
                <div className="flex items-start gap-4">
                  <img src={member.avatar_url} alt={member.login} className="w-12 h-12 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-surface-900 truncate">{member.name || member.login}</h3>
                      <ExternalLink size={14} className="text-surface-300 group-hover:text-surface-500 shrink-0" />
                    </div>
                    <p className="text-sm text-surface-500">@{member.login}</p>
                    {member.bio && <p className="text-xs text-surface-400 mt-1 line-clamp-2">{member.bio}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                      {member.company && <span className="flex items-center gap-1"><Building2 size={12} />{member.company}</span>}
                      {member.location && <span className="flex items-center gap-1"><MapPin size={12} />{member.location}</span>}
                      <span className="flex items-center gap-1"><Star size={12} />{member.followers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

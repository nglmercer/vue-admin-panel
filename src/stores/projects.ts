import { defineStore } from 'pinia'
import { addProject, getProjects, Pagination, removeProject, Sorting, updateProject } from '../data/pages/projects'
import { Project } from '../pages/projects/types'

export const useProjectsStore = defineStore('projects', {
  state: () => {
    return {
      items: [] as Project[],
      pagination: {
        page: 1,
        perPage: 10,
        total: 0,
      } as Pagination,
    }
  },

  actions: {
    async getAll(options: { pagination: Pagination; sorting?: Sorting }) {
      const { data, pagination } = await getProjects({
        ...options.sorting,
        ...options.pagination,
      })
      this.items = data
      this.pagination = pagination
    },

    async add(project: Omit<Project, 'id' | 'created_at'>) {
      const response = await addProject(project)
      if (response.success) {
        this.items.push(response.data)
      }
    },

    async update(project: Project) {
      const response = await updateProject(project)
      if (response.success) {
        const index = this.items.findIndex(({ id }) => id === project.id)
        this.items.splice(index, 1, response.data)
      }
    },

    async remove(project: Project) {
      const response = await removeProject(project)

      if (response) {
        const index = this.items.findIndex(({ id }) => id === project.id)
        this.items.splice(index, 1)
      }
    },
  },
})

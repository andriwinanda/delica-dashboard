import axiosHelper from '@/utils/axiosHelper'
import {
  getBranchesApiUrl,
  getBranchMutationsApiUrl,
  getCustomersApiUrl,
  getLocationsApiUrl,
  getQuotationsApiUrl
} from '@/utils/env'
import type { Branch, BranchPayload, Location } from '@/types/api'

export type ManagementRecord = Record<string, any>

const unwrapList = <T>(responseData: any): T[] => {
  const payload = responseData?.data ?? responseData
  return Array.isArray(payload) ? payload : (payload?.items || payload?.content || [])
}

const unwrapDetail = <T>(responseData: any): T => responseData?.data ?? responseData

export const managementService = {
  async listBranches(): Promise<Branch[]> {
    return unwrapList<Branch>((await axiosHelper.get(getBranchesApiUrl())).data)
  },
  async getBranch(id: string | number): Promise<Branch> {
    return unwrapDetail<Branch>((await axiosHelper.get(getBranchesApiUrl(id))).data)
  },
  createBranch(payload: BranchPayload) {
    return axiosHelper.post(getBranchMutationsApiUrl(), payload)
  },
  updateBranch(id: string | number, payload: BranchPayload) {
    return axiosHelper.put(getBranchMutationsApiUrl(id), payload)
  },
  async listLocations(): Promise<Location[]> {
    return unwrapList<Location>((await axiosHelper.get(getLocationsApiUrl())).data)
  },
  async getLocation(id: string | number): Promise<Location> {
    return unwrapDetail<Location>((await axiosHelper.get(getLocationsApiUrl(id))).data)
  },
  async listCustomers(): Promise<ManagementRecord[]> {
    return unwrapList<ManagementRecord>((await axiosHelper.get(getCustomersApiUrl())).data)
  },
  createCustomer(payload: ManagementRecord) {
    return axiosHelper.post(getCustomersApiUrl(), payload)
  },
  updateCustomer(id: string | number, payload: ManagementRecord) {
    return axiosHelper.put(getCustomersApiUrl(id), payload)
  },
  deleteCustomer(id: string | number) {
    return axiosHelper.delete(getCustomersApiUrl(id))
  },
  async listQuotations(): Promise<ManagementRecord[]> {
    return unwrapList<ManagementRecord>((await axiosHelper.get(getQuotationsApiUrl())).data)
  },
  createQuotation(payload: ManagementRecord) {
    return axiosHelper.post(getQuotationsApiUrl(), payload)
  },
  updateQuotation(id: string | number, payload: ManagementRecord) {
    return axiosHelper.put(getQuotationsApiUrl(id), payload)
  },
  deleteQuotation(id: string | number) {
    return axiosHelper.delete(getQuotationsApiUrl(id))
  }
}

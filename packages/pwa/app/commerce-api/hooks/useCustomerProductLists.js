/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * *
 * Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. *
 * * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
import {useContext, useMemo, useEffect, useState} from 'react'
import {isError, useCommerceAPI, CustomerProductListsContext} from '../utils'
import useCustomer from './useCustomer'
import {customerProductListTypes} from '../../constants'
// If the customerProductLists haven't yet loaded we store user actions inside
// eventQueue and process the eventQueue once productLists have loaded
const eventQueue = []

export const eventActions = {
    ADD: 'add',
    REMOVE: 'remove'
}

export default function useCustomerProductLists() {
    const api = useCommerceAPI()
    const customer = useCustomer()
    const {customerProductLists, setCustomerProductLists} = useContext(CustomerProductListsContext)
    const [isLoading, setIsLoading] = useState(false)

    const processEventQueue = async () => {
        while (eventQueue.length) {
            // get the first item
            const event = eventQueue.shift()
            switch (event.action) {
                case eventActions.ADD: {
                    try {
                        const wishlist = self.getProductListPerType(
                            customerProductListTypes.WISHLIST
                        )
                        const productListItem = wishlist.customerProductListItems.find(
                            ({productId}) => productId === event.item.id
                        )
                        // if the item is already in the wishlist
                        // only update the quantity
                        if (productListItem) {
                            await self.updateItemToWishlist(
                                event.item.id,
                                productListItem,
                                event.item.quantity,
                                wishlist.id
                            )
                            return event.onSuccess(event.item.quantity)
                        }
                        await self.addItemToWishlist(
                            event.item.id,
                            event.item.quantity,
                            wishlist.id
                        )
                        return event.onSuccess?.(event.item.quantity)
                    } catch (error) {
                        event.onError?.()
                    }
                    break
                }

                case eventActions.REMOVE:
                    try {
                        await self.deleteCustomerProductListItem(event.item, event.listId)
                        event.onSuccess?.()
                        break
                    } catch (error) {
                        event.onError?.()
                    }
            }
        }
    }

    useEffect(() => {
        if (eventQueue.length && customerProductLists?.data.length) {
            processEventQueue()
        }
    }, [customerProductLists])

    const self = useMemo(() => {
        return {
            ...customerProductLists,
            get showLoader() {
                return isLoading
            },

            get loaded() {
                return !!customerProductLists?.data?.length
            },

            getProductListPerType(type) {
                return customerProductLists?.data.find((list) => list.type === type)
            },

            clearProductLists() {
                // clear out the product lists in context
                setCustomerProductLists({})
            },

            /**
             * Add an item to wishlist
             * @param {object} productId - the product id to be added to wishlist
             * @param {number} quantity - the number of items to be added to wishlist
             * @param {string} wishlistId - id of the wishlist to add item to
             * @returns {object} product lists
             */
            async addItemToWishlist(productId, quantity, wishlistId) {
                const requestBody = {
                    productId,
                    priority: 1,
                    quantity,
                    public: false,
                    type: 'product'
                }

                return await self.createCustomerProductListItem(requestBody, wishlistId)
            },

            /**
             * Update an item in wish list
             * @param {string} productId - id of the product to be updated
             * @param {object} productListItem - the product item in wishlist
             * @param {number} quantity - number to be updated to the wishlist
             * @param {string} wishlistId - wish list id
             * @returns {Promise<*>}
             */
            async updateItemToWishlist(productId, productListItem, quantity, wishlistId) {
                const requestBody = {
                    productId,
                    priority: 1,
                    // increase the quantity if that item already exists in the wishlist
                    // since we allow an item to be added multiple times
                    quantity: productListItem.quantity + quantity,
                    public: false,
                    type: 'product'
                }
                return await self.updateCustomerProductListItem(
                    requestBody,
                    wishlistId,
                    productListItem.id
                )
            },

            /**
             * Fetches product lists for registered users or creates a new list if none exist
             * due to the api limitation, we can not get the list based on type but all lists
             * @param {string} type type of list to fetch or create
             * @returns product lists for registered users
             */
            async fetchOrCreateProductLists(type) {
                setIsLoading(true)
                // fetch customer productLists
                const response = await api.shopperCustomers.getCustomerProductLists({
                    body: [],
                    parameters: {
                        customerId: customer.customerId
                    }
                })

                setIsLoading(false)
                if (isError(response)) {
                    throw new Error(response)
                }

                if (response?.data?.length && response?.data?.some((list) => list.type === type)) {
                    // only set the lists when there is at least one type we need. etc wishlist
                    return setCustomerProductLists(response)
                }

                setIsLoading(true)
                // create a new list to be used later
                const newProductList = await api.shopperCustomers.createCustomerProductList({
                    body: {
                        type
                    },
                    parameters: {
                        customerId: customer.customerId
                    }
                })

                setIsLoading(false)
                if (isError(newProductList)) {
                    throw new Error(newProductList)
                }
                // This function does not return an updated customerProductsList so we fetch manually
                await this.getCustomerProductLists()
            },

            /**
             * Fetches product lists for registered users
             * @returns product lists for registered users
             */
            async getCustomerProductLists() {
                setIsLoading(true)
                const response = await api.shopperCustomers.getCustomerProductLists({
                    body: [],
                    parameters: {
                        customerId: customer.customerId
                    }
                })

                setIsLoading(false)
                if (isError(response)) {
                    throw new Error(response)
                }

                setCustomerProductLists(response)
                return response
            },

            /**
             * Event queue holds user actions that need to execute on product-lists
             * while the product list information has not yet loaded (eg: Adding to wishlist immedeately after login).
             * @param {object} event Event to be added to queue. event object has properties: action: {item: Object, listId?: string, action: eventActions, listType: CustomerProductListType}
             */
            addActionToEventQueue(event) {
                eventQueue.push(event)
            },

            /**
             * Creates a new customer product list
             * @param {Object} requestBody object containing type property to define the type of list to be created
             */
            async createCustomerProductList(requestBody) {
                setIsLoading(true)
                const response = await api.shopperCustomers.createCustomerProductList({
                    body: requestBody,
                    parameters: {
                        customerId: customer.customerId
                    }
                })

                setIsLoading(true)
                if (isError(response)) {
                    throw new Error(response)
                }

                // This function does not return an updated customerProductsLists so we fetch manually
                await this.getCustomerProductLists()
                return response
            },

            /**
             * Adds an item to the customer's product list.
             * @param {Object} item item to be added to the list.
             * @param {string} listId id of the list to add the item to.
             */
            async createCustomerProductListItem(item, listId) {
                setIsLoading(true)
                console.log('item', item)
                const response = await api.shopperCustomers.createCustomerProductListItem({
                    body: item,
                    parameters: {
                        customerId: customer.customerId,
                        listId
                    }
                })

                setIsLoading(false)

                if (isError(response)) {
                    throw new Error(response)
                }

                // This function does not return an updated customerProductsList so we fetch manually
                await self.getCustomerProductLists()
                return response
            },

            async updateCustomerProductListItem(item, listId, itemId) {
                setIsLoading(true)
                console.log('item', item)
                const response = await api.shopperCustomers.updateCustomerProductListItem({
                    body: item,
                    parameters: {
                        customerId: customer.customerId,
                        listId,
                        itemId
                    }
                })

                setIsLoading(false)

                if (isError(response)) {
                    throw new Error(response)
                }

                // This function does not return an updated customerProductsList so we fetch manually
                await self.getCustomerProductLists()
                return response
            },

            /**
             * Fetch list of product details from list of ids.
             * The maximum number of productIDs that can be requested are 24.
             * @param {string} ids list of productIds
             * @returns {Object[]} list of product details for requested productIds
             */
            async getProductsInList(ids, listId) {
                if (!ids) {
                    return
                }

                const response = await api.shopperProducts.getProducts({
                    parameters: {
                        ids
                    }
                })

                if (isError(response)) {
                    throw new Error(response)
                }

                const itemDetail = response.data.reduce((result, item) => {
                    const key = item.id
                    result[key] = item
                    return result
                }, {})

                const updatedProductLists = {
                    ...customerProductLists,
                    data: customerProductLists.data.map((list) => {
                        if (list.id === listId) {
                            return {
                                ...list,
                                _productItemsDetail: {...list._productItemsDetail, ...itemDetail}
                            }
                        }
                        return list
                    })
                }

                setCustomerProductLists(updatedProductLists)
            },

            /**
             * Remove an item from a customerProcuctList
             * @param {string} itemId id of item (in product-list not productId) to be removed
             * @param {string} listId id of list to remove item from
             */
            async deleteCustomerProductListItem(item, listId) {
                // Delete item API returns a void response which throws a json parse error,
                // passing true as 2nd argument to get raw json response
                const response = await api.shopperCustomers.deleteCustomerProductListItem(
                    {
                        parameters: {
                            itemId: item.id,
                            listId,
                            customerId: customer.customerId
                        }
                    },
                    true
                )

                if (isError(response)) {
                    throw new Error(response)
                }

                // Remove item API does not return an updated list in response so we manually remove item
                // from state and update UI without requesting updated list from API
                const updatedProductLists = {
                    ...customerProductLists,
                    data: customerProductLists.data.map((list) => {
                        if (list.id === listId) {
                            return {
                                ...list,
                                customerProductListItems: list.customerProductListItems.filter(
                                    (x) => x.id !== item.id
                                )
                            }
                        }
                        return list
                    })
                }

                setCustomerProductLists(updatedProductLists)
            }
        }
    }, [customer, customerProductLists, setCustomerProductLists, isLoading])
    return self
}

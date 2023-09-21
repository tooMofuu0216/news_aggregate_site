import { Box, Center, Icon, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalContent, ModalOverlay, Spinner, Stack } from '@chakra-ui/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { AiOutlineSearch } from 'react-icons/ai';
import { api } from '~/utils/api';

interface SearchModalProp {
    isOpen: boolean
    onClose: () => void
}

export const SearchModal = ({ isOpen, onClose }: SearchModalProp) => {
    const [debouncedValue, setDebouncedValue] = useState("");
    let debounceTimer: NodeJS.Timeout;
    const debounceDelay = 500; // Adjust this value to your needs
    const handleSearch = (ev: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = ev.target.value
        // Use setTimeout to delay the execution of the action
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            setDebouncedValue(inputVal); // Update debounced value after delay
        }, debounceDelay);
    }

    const { data, isSuccess, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading, } = api.news.searchNewsByTitle.useInfiniteQuery(
        { searchText: debouncedValue },
        {
            getNextPageParam: (lastPage) => lastPage?.nextCursor,
        },
    )


    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent p={2}>
                <ModalBody>
                    <Stack spacing={4} >
                        <InputGroup>
                            <InputLeftElement pointerEvents='none'>
                                <Icon as={AiOutlineSearch} color='gray.300' />
                            </InputLeftElement>
                            <Input
                                type='text'
                                placeholder='Search News'
                                onChange={handleSearch} />
                        </InputGroup>
                        <Box>
                            {!isLoading ?
                                data?.pages.map((newsPage, idx) => (
                                    <>
                                        {
                                            newsPage?.newsList.map((singleNews, idx) =>
                                            (
                                                <Box
                                                    key={singleNews.id}
                                                    cursor={`pointer`}
                                                    _hover={{
                                                        textDecoration: "underline",
                                                    }}
                                                    _focus={{
                                                        outline: `none`
                                                    }}
                                                    p={2}
                                                    bgColor={`teal.100`}
                                                    m={2}
                                                    borderRadius={'md'}
                                                >
                                                    <Link
                                                        className={`inline-block
                                                     whitespace-nowrap overflow-hidden
                                                      text-ellipsis max-w-xs`}
                                                        target='_blank'
                                                        href={singleNews.url}>

                                                        {singleNews.title}
                                                    </Link>
                                                </Box>
                                            ))
                                        }
                                    </>
                                ))

                                :
                                <Center>
                                    <Spinner />
                                </Center>
                            }
                        </Box>
                    </Stack>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

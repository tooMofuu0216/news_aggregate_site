import { Icon, Input, InputGroup, InputLeftElement, Stack, useDisclosure } from '@chakra-ui/react';
import Link from 'next/link';
import React, { type Dispatch, type SetStateAction, useState } from 'react'
import { AiOutlineSearch } from 'react-icons/ai';
import { SearchModal } from './SearchModal';

export const NavBar = ({ setTopic }: { setTopic: Dispatch<SetStateAction<string>> }) => {
    const [showMenu, setShowMenu] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const topicList = [`NATION`, `WORLD`]

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };


    const navItems = (
        <>
            <li className='hover:text-amber-500 cursor-pointer' onClick={() => setTopic("")}>
                All 
            </li> 
            <li className='hover:text-amber-500 cursor-pointer' onClick={() => setTopic(topicList[0] ?? "")}>
                Local 
            </li> 
            <li className='hover:text-amber-500 cursor-pointer' onClick={() => setTopic(topicList[1] ?? "")}>
                World
            </li>
        </>
    )

    return (
        <>
            <nav className="shadow-ls p-4 border-y-2 w-full bg-white z-50 fixed top-0">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="text-2xl font-bold">
                        <Link href="/" onClick={() => setTopic("")}>HK News</Link>
                    </div>
                    <Stack spacing={4} maxW={'lg'} onClick={onOpen}>
                        <InputGroup>
                            <InputLeftElement pointerEvents='none'>
                                <Icon as={AiOutlineSearch} color='gray.300' />
                            </InputLeftElement>
                            <Input type='text' placeholder='Search News' />
                        </InputGroup>
                    </Stack>
                    <ul className={`hidden md:flex space-x-4 ${showMenu ? 'block' : 'hidden'}`}>
                        {navItems}
                    </ul>
                    <div className="md:hidden">
                        <button onClick={toggleMenu} className="text-3xl hover:text-amber-500">
                            {showMenu ? '×' : '☰'}
                        </button>
                    </div>

                    <div className={`md:hidden absolute top-16 right-0 w-screen
                text-center z-50 ${showMenu ? 'block' : 'hidden'} bg-white`}>
                        <ul className="px-4 py-2 cursor-pointer space-y-4">
                            {navItems}
                        </ul>
                    </div>
                </div>
            </nav>

            <SearchModal isOpen={isOpen} onClose={onClose} />
        </>
    )
}

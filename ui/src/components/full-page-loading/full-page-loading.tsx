import BounceLoader from 'react-spinners/BounceLoader';

const FullPageLoading = () => {
    return (
        <div className='full-page-loading w-full h-[90vh] flex flex-col justify-center items-center'>
            <BounceLoader color='#000' />
        </div>
    );
};

export default FullPageLoading;

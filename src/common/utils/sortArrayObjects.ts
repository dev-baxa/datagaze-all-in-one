import { DiskDto, NetworkAdapterDto } from 'src/modules/v1/agent/dto/create.agent.dto';

// Massivni tartiblash funksiyasi
export function sortArrayOfObjects(
    arr: (NetworkAdapterDto | DiskDto)[],
): (NetworkAdapterDto | DiskDto)[] {
    return arr
        .map(obj => sortObjectKeys(obj)) // Har bir obyektning kalitlarini tartiblash
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))); // Obyektlarni o‘zaro tartiblash
}

// Obyekt kalitlarini tartiblash funksiyasi
function sortObjectKeys(obj: NetworkAdapterDto | DiskDto): NetworkAdapterDto | DiskDto {
    return Object.keys(obj)
        .sort()
        .reduce(
            (acc, key) => {
                acc[key] = obj[key];
                return acc;
            },
            {} as NetworkAdapterDto | DiskDto,
        );
}

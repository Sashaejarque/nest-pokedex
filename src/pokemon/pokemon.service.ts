import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `El pokemon ya existe ${JSON.stringify(error.keyValue)}`,
        );
      }
      console.error(error);
      throw new InternalServerErrorException(
        'No se puede crear pokemon. Chequear logs de consola',
      );
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(id: string) {
    let pokemon: Pokemon;

    try {
      if (!isNaN(+id)) {
        pokemon = await this.pokemonModel.findOne({ no: id });
      }
      if (!pokemon && isValidObjectId(id)) {
        pokemon = await this.pokemonModel.findById(id);
      }
      if (!pokemon) {
        pokemon = await this.pokemonModel.findOne({
          name: id.toLocaleLowerCase().trim(),
        });
      }
      if (!pokemon) {
        throw new NotFoundException(
          `Pokemon con el id, nombre o no "${id} no se encontro"`,
        );
      }

      return pokemon;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'No se puede encontrar pokemons. Chequear logs de consola',
      );
    }
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return `This action updates a #${id} pokemon`;
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }
}

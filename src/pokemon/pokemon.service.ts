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
      this.handleExceptions(error, 'crear');
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

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id);
    try {
      if (updatePokemonDto.name)
        updatePokemonDto.name = updatePokemonDto.name.trim().toLowerCase();

      await pokemon.updateOne(updatePokemonDto, { new: true });
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error, 'actualizar');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }

  private handleExceptions(error: any, typeApi: string) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `El pokemon ya existe ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.error(error);
    throw new InternalServerErrorException(
      `No se puede ${typeApi} pokemon. Chequear logs de consola`,
    );
  }
}
